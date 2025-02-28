import {execSync} from 'child_process'

import * as core from '@actions/core'

export async function getPackageManager(): Promise<'pnpm' | 'yarn' | 'npm'> {
    const PACKAGE_MANAGER = core.getInput('PACKAGE_MANAGER')

    if (!(PACKAGE_MANAGER === 'pnpm' || PACKAGE_MANAGER === 'yarn' || PACKAGE_MANAGER === 'npm')) {
        return 'npm'
    }

    return PACKAGE_MANAGER
}

export async function runVitestBench({
    includeFiles,
    outputFile = 'result.json',
}: {
    includeFiles?: string[]
    outputFile?: string
}) {
    const packageManager = await getPackageManager()
    try {
        const option = [
            includeFiles && includeFiles.length > 0 ? `${includeFiles.filter(Boolean).join(' ')}` : null,
            outputFile ? `--outputJson ${outputFile}` : null,
            `--watch false`,
        ]
            .filter(Boolean)
            .join(' ')

        if (packageManager === 'pnpm') {
            execSync(`pnpm vitest bench${option ? ` ${option}` : ''}`, {
                encoding: 'utf8',
            })
        } else if (packageManager === 'yarn') {
            execSync(`yarn run vitest bench${option ? ` ${option}` : ''}`, {
                encoding: 'utf8',
            })
        } else {
            execSync(`npm run vitest -- bench${option ? ` ${option}` : ''}`, {
                encoding: 'utf8',
            })
        }
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error:', (error as Error).message)
        return null
    }
}
