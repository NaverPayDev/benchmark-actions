import {execSync} from 'child_process'
import fs from 'fs'

export async function writeBenchMark({
    content,
    markdownFile = 'BENCHMARK.md',
}: {
    content: string
    markdownFile?: string
}) {
    try {
        fs.writeFileSync(markdownFile, content, 'utf8')

        execSync(`git config --global user.name 'github-actions[bot]'`, {
            encoding: 'utf8',
        })
        execSync(`git config --global user.email 'github-actions[bot]@users.noreply.github.com'`, {
            encoding: 'utf8',
        })
        execSync(`git add ${markdownFile}`, {
            encoding: 'utf8',
        })
        execSync(`git commit -m "📝 docs: update benchmark results [skip ci]" --no-verify`, {
            encoding: 'utf8',
        })
        execSync(`git push`, {
            encoding: 'utf8',
        })
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error:', (error as Error).message)
    }
}
