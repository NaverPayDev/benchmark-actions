import * as core from '@actions/core'
import * as github from '@actions/github'

export async function getGithubInfo() {
    try {
        const myToken = core.getInput('GITHUB_TOKEN')
        const srcPath = core.getInput('SOURCE_ROOT') || './src'
        const prNumber = Number(core.getInput('PR_NUMBER')) || 0
        const {pull_request, repository} = github.context.payload
        const repo = github.context.repo

        if (prNumber && prNumber > 0) {
            const octokit = github.getOctokit(myToken);

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
    const myToken = core.getInput('GITHUB_TOKEN')
    const octokit = github.getOctokit(myToken)

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
