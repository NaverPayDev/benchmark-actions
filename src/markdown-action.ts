import {makeBenchJson} from './utils/makeBenchJson'
import {getGithubInfo} from './utils/getGithubInfo'
import {makeMarkdown} from './utils/makeMarkdown'
import {writeBenchMark} from './utils/writeBenchMark'

export async function markdownAction(): Promise<string> {
    const githubInfo = await getGithubInfo()

    if (!githubInfo) {
        return 'No github info'
    }
    const {baseTarget, repoUrl} = githubInfo

    const resultBench = await makeBenchJson({})

    if (!resultBench) {
        return 'No bench files found'
    }
    // json 파일을 읽어서 마크다운 파일을 만듭니다.
    const resultMarkdown = await makeMarkdown({
        data: resultBench,
        target: baseTarget,
        repoUrl,
        isBenchMarkdown: true,
    })

    if (!resultMarkdown) {
        return 'No markdown'
    }
    const updateAction = `*Last updated by [GitHub Actions](${repoUrl}/actions/runs/${process.env.GITHUB_RUN_ID})*`
    await writeBenchMark({
        content: `${resultMarkdown}\n\n${updateAction}`,
    })
    return 'Done'
}
