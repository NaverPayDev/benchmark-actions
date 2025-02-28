import * as core from '@actions/core'
import * as github from '@actions/github'

export async function getGithubInfo() {
    try {
        const srcPath = core.getInput('SOURCE_ROOT') || './src'
        const {pull_request, repository} = github.context.payload
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

export async function getPullRequestDiffFiles() {
    const myToken = core.getInput('GITHUB_TOKEN')
    const octokit = github.getOctokit(myToken)

    const repo = github.context.repo

    const {data: list} = await octokit.rest.pulls.listFiles({
        ...repo,
        pull_number: github.context.payload.pull_request?.number || 0,
        mediaType: {
            format: 'diff',
        },
    })

    return list.map((file) => file.filename)
}
