/* eslint-disable no-console */
import fs from 'fs'
import path from 'path'

import {getPullRequestDiffFiles} from './getGithubInfo'
import {b} from 'vite-node/index-z0R8hVRu'

/**
 * 주어진 폴더 내에 포함된 모든 파일들을 검색 합니다.
 **/
function findFilesInDirectory(defaultDir: string, fileNames: string[]) {
    const getFindFiles = (dir: string) => {
        const result: string[] = []

        const entries = fs.readdirSync(dir, {withFileTypes: true})

        entries.forEach((entry) => {
            const fullPath = path.join(dir, entry.name)

            if (entry.isDirectory()) {
                const list = getFindFiles(fullPath)
                list.forEach((item) => {
                    result.push(item)
                })
            } else if (entry.isFile() && fileNames.some((ext) => entry.name.endsWith(ext))) {
                result.push(fullPath)
            }
        })

        return result
    }
    return getFindFiles(defaultDir)
}

type AllImportsInFiles = Map<
    string,
    {
        rootFile: boolean
        filePath: string
        parents: Set<string>
        imports: Set<string>
    }
>

/**
 * 주어진 파일 내에 포함된 import 구문을 찾아 반환합니다.
 **/
function findAllImportsInFiles(benchFiles: string[]): AllImportsInFiles {
    // import 한 친구를 찾아야함
    const result = new Map<
        string,
        {
            rootFile: boolean
            filePath: string
            parents: Set<string>
            imports: Set<string>
        }
    >()

    function findImportsRecursively({
        filePath,
        parentPath,
        isBenchFile,
    }: {
        filePath: string
        parentPath?: string
        isBenchFile: boolean
    }) {
        if (result.has(filePath)) {
            // eslint-disable-next-line no-console
            console.log('has', filePath)
            result.get(filePath)?.parents.add(filePath)
            // Avoid infinite recursion by skipping already visited files
            return
        }
        // eslint-disable-next-line no-console
        console.log('none', filePath)

        if (!fs.existsSync(filePath)) {
            console.warn(`Warning: File does not exist - ${filePath}`)
            return
        }

        const importedFiles = new Set<string>()

        const content = fs.readFileSync(filePath, 'utf-8')

        const importRegex = /import\s+.*?['|"](.*?)['|"]/g

        let match

        while ((match = importRegex.exec(content)) !== null) {
            const importPath = match[1]

            if (['./', '../'].some((ext) => importPath.startsWith(ext))) {
                const resultFilePath = path.resolve(path.dirname(filePath), importPath)
                const extList = ['.ts', '.js']
                extList.some((ext) => {
                    if (resultFilePath.endsWith(ext)) {
                        importedFiles.add(resultFilePath)
                        return true
                    } else if (fs.existsSync(`${resultFilePath}${ext}`)) {
                        importedFiles.add(`${resultFilePath}${ext}`)
                        return true
                    }
                    return false
                })
            }
        }

        const parents = new Set<string>()

        if (parentPath) {
            parents.add(parentPath)
        }

        result.set(filePath, {
            rootFile: isBenchFile,
            filePath,
            parents,
            imports: importedFiles,
        })

        // Get the imports within the imported files recursively
        importedFiles.forEach((importedFile) => {
            findImportsRecursively({
                filePath: importedFile,
                parentPath: filePath,
                isBenchFile: false,
            })
        })
    }

    // 밴치 파일
    benchFiles.forEach((benchFilePath) => {
        findImportsRecursively({
            filePath: benchFilePath,
            isBenchFile: true,
        })
    })

    return result
}

function findFiles(importsFileTree: AllImportsInFiles, diffFiles: string[]): string[] {
    const result = new Set<string>()
    const getImportFile = (diffFile: string) => {
        // const item = importsFileTree.get(importFile)
        for (const [importFile, item] of importsFileTree) {
            if (importFile.endsWith(diffFile)) {
                if (item?.rootFile) {
                    result.add(diffFile)
                } else if (item) {
                    item.parents.forEach((parentFile) => {
                        getImportFile(parentFile)
                    })
                }
            }
        }
    }

    diffFiles.forEach((importFile) => {
        getImportFile(importFile)
    })
    return [...result.values()]
}

/** 주어진 파일 목록을 반환합니다. */
export async function getBenchFiles({
    srcPath,
    targetFileNames,
    prNumber,
}: {
    target: string
    prNumber: number
    srcPath: string
    targetFileNames: string[]
}) {
    const srcDirPath = path.resolve(srcPath) // Set the directory to "src"
    if (fs.existsSync(srcDirPath)) {
        // 모든 bench 파일을 찾습니다.
        const benchFiles = findFilesInDirectory(srcDirPath, targetFileNames)
        console.log('Found bench files:', benchFiles)

        // bench 파일에서 import 한 파일을 찾습니다.
        const importsFileTree = findAllImportsInFiles(benchFiles)
        console.log('Found imports files:', [...importsFileTree.keys()])

        // branch 에서 diff 파일들을 찾습니다.
        const diffFiles = await getPullRequestDiffFiles({pullNumber: prNumber})
        console.log('Found diff files:', diffFiles)

        // 결과를 찾아 받환합니다.
        const result = findFiles(importsFileTree, diffFiles)
        console.log(result)

        return result
    } else {
        return []
    }
}
