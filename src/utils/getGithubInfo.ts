import * as core from '@actions/core'
import * as github from '@actions/github'

function getOctokit() {
    const myToken = core.getInput('GITHUB_TOKEN')
    return github.getOctokit(myToken)
}

export async function getGithubInfo() {
    try {
        const srcPath = core.getInput('SOURCE_ROOT') || './src'
        const prNumber = Number(core.getInput('PR_NUMBER')) || 0
        const {pull_request, repository} = github.context.payload
        const repo = github.context.repo

        if (prNumber && prNumber > 0) {
            const octokit = getOctokit()

            const {data} = await octokit.rest.pulls.get({
                ...repo,
                pull_number: prNumber,
            })

            return {
                baseTarget: data?.base.ref || 'main',
                repoUrl: repository?.html_url || `https://github.com/NaverPayDev/hidash`,
                srcPath,
                issueNumber: data?.number ?? 0,
            }
        }

        return {
            baseTarget: pull_request?.base.ref || 'main',
            repoUrl: repository?.html_url || `https://github.com/NaverPayDev/hidash`,
            srcPath,
            issueNumber: pull_request?.number ?? 0,
        }
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error:', (error as Error).message)
        return null
    }
}

export async function getPullRequestDiffFiles({pullNumber}: {pullNumber: number}) {
    const octokit = getOctokit()

    const repo = github.context.repo

    const {data: list} = await octokit.rest.pulls.listFiles({
        ...repo,
        pull_number: pullNumber,
        mediaType: {
            format: 'diff',
        },
    })

    return list.map((file) => file.filename)
}

export async function fetchIssueComment({content, issueNumber}: {content: string; issueNumber: number}) {
    try {
        const octokit = getOctokit()

        const repo = github.context.repo
        const result = {
            ...repo,
            body: content,
        }

        const {data: comments} = await octokit.rest.issues.listComments({
            ...repo,
            issue_number: issueNumber,
        })

        const existingComment = comments.find((comment) => comment?.body?.includes('### Benchmark Results'))


        if (existingComment) {
            console.log('existingComment.id', existingComment.id)
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
