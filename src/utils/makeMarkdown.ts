import {type Bench} from './interfaces'

function getMethodName(filePath: string) {
    const match = filePath.match(/\/([^/]+)\.bench\.(t|j)s$/)
    return match ? match[1] : filePath
}

export async function makeMarkdown({
    data: benchmarkData,
    target,
    repoUrl,
    isBenchMarkdown,
}: {
    data: Bench
    target: string
    repoUrl: string
    isBenchMarkdown: boolean
}) {
    try {
        const results = []

        for (const file of benchmarkData.files) {
            const methodName = getMethodName(file.filepath)

            for (const group of file.groups) {
                if (group.benchmarks.length === 2) {
                    const [bench1, bench2] = group.benchmarks
                    const hidashBench = bench1.name.includes('hidash') ? bench1 : bench2
                    const lodashBench = bench1.name.includes('lodash') ? bench1 : bench2
                    const isHidashFaster = hidashBench.hz > lodashBench.hz
                    const ratio = (
                        Math.max(hidashBench.hz, lodashBench.hz) / Math.min(hidashBench.hz, lodashBench.hz)
                    ).toFixed(2)
                    const warningEmoji = !isHidashFaster ? ' ⚠️' : ''

                    results.push({
                        method: methodName,
                        fullName: group.fullName,
                        isHidashFaster,
                        winner: isHidashFaster ? 'hidash' : 'lodash',
                        ratio,
                        loser: isHidashFaster ? 'lodash' : 'hidash',
                        hidashHz: hidashBench.hz.toFixed(2),
                        lodashHz: lodashBench.hz.toFixed(2),
                        warningEmoji,
                    })
                }
            }
        }

        const markdownParts = [
            isBenchMarkdown
                ? '# Benchmark Results\n\nLatest benchmark results comparing hidash vs lodash performance.'
                : '### Benchmark Results',
            '',
            '| Method | Test | Performance Comparison | `hidash` ops/sec | `lodash@4.17.21` ops/sec |',
            '|--------|------|----------------------|----------------|----------------|',
            ...results.map((result) => {
                const hidashCol = result.isHidashFaster ? `${result.hidashHz} 🏆` : result.hidashHz
                const lodashCol = !result.isHidashFaster ? `${result.lodashHz} 🏆` : result.lodashHz
                return `| [${result.method}](${repoUrl}/blob/${target}/src/${result.method}.ts)${result.warningEmoji} | ${result.fullName} | ${result.winner} is ${result.ratio}x faster | ${hidashCol} | ${lodashCol} |`
            }),
            '',
            '> Note: Higher operations per second (ops/sec) numbers are better. Each test compares hidash vs lodash implementation.',
            '> ',
            '> ⚠️ indicates where hidash is slower than lodash.',
            '> ',
            '> 🏆 indicates the faster implementation.',
        ]

        if (isBenchMarkdown) {
            markdownParts.push('', `\n_Last updated: ${new Date().toISOString().split('T')[0]}_`)
        } else {
            markdownParts.push(
                '',
                '<details>',
                '<summary>View Full Benchmark Data</summary>',
                '',
                '```json',
                JSON.stringify(benchmarkData, null, 2),
                '```',
                '</details>',
            )
        }

        return markdownParts.join('\n')
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error:', (error as Error).message)
        return null
    }
}
