import {fetchIssueComment} from './utils/fetchIssueComment'
import {makeBenchJson} from './utils/makeBenchJson'
import {getBenchFiles} from './utils/getBenchFiles'
import {getGithubInfo} from './utils/getGithubInfo'
import {makeMarkdown} from './utils/makeMarkdown'

export async function commentAction(): Promise<string> {
    const githubInfo = await getGithubInfo()

    if (!githubInfo) {
        return 'No github info'
    }
    console.log('info:', githubInfo)
    const {baseTarget, repoUrl, issueNumber, srcPath} = githubInfo

    // bench 파일 목록을 반환합니다.
    const files = await getBenchFiles({
        target: baseTarget,
        srcPath,
        prNumber: issueNumber,
        targetFileNames: ['.bench.js', '.bench.ts'],
    })

    if (!files.length) {
        return 'Not Found bench files'
    }
    console.log('Found Run bench files:', files)

    // benchmark 결과를 반환합니다.
    const resultBench = await makeBenchJson({
        includeFiles: files,
    })

    if (!resultBench) {
        return 'Not Found bench json file'
    }
    console.log('Result bench file')
    // json 파일을 읽어서 마크다운 파일을 만듭니다.
    const resultMarkdown = await makeMarkdown({
        data: resultBench,
        target: baseTarget,
        repoUrl,
        isBenchMarkdown: false,
    })

    if (!resultMarkdown) {
        return 'No markdown'
    }
    console.log('Result markdown')

    const updateAction = `*Last updated by [GitHub Actions](${repoUrl}/actions/runs/${process.env.GITHUB_RUN_ID})*`
    // 작성된 benchmark 결과를 comment 에 작성합니다.
    await fetchIssueComment({
        content: `${resultMarkdown}\n\n${updateAction}`,
        issueNumber,
    })
    return 'Done'
}
