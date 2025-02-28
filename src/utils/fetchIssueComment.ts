import * as core from '@actions/core'
import * as github from '@actions/github'

export async function fetchIssueComment({content, issueNumber}: {content: string; issueNumber: number}) {
    try {
        const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN')
        const octokit = github.getOctokit(GITHUB_TOKEN)

        const {
            repo: {owner, repo},
        } = github.context

        if (!repo || !owner) {
            core.setFailed('필수 정보 (repo, owner)를 가지고 오지 못했습니다.')
        }
        const {data: comments} = await octokit.rest.issues.listComments({
            owner,
            repo,
            issue_number: issueNumber,
        })

        const existingComment = comments.find((comment) => comment?.body?.includes('### Benchmark Results'))

        const result = {
            owner,
            repo,
            body: content,
        }

        if (existingComment) {
            await octokit.rest.issues.updateComment({
                ...result,
                comment_id: existingComment.id,
            })
        } else {
            await octokit.rest.issues.createComment({
                ...result,
                issue_number: issueNumber,
            })
        }
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error:', (error as Error).message)
    }
}
