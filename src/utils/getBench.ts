import fs from 'fs'
import path from 'path'

import {type Bench} from './interfaces'
import {runVitestBench} from './packageManager'

export async function getBench({
    includeFiles,
    outputFile = 'result.json',
}: {
    includeFiles?: string[]
    outputFile?: string
}): Promise<Bench | null> {
    try {
        await runVitestBench({
            includeFiles,
            outputFile,
        })

        const outputFilePath = path.resolve(outputFile)
        const result = fs.readFileSync(outputFilePath, {
            encoding: 'utf8',
        })

        return JSON.parse(result) as Bench
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error:', (error as Error).message)
        return null
    }
}
