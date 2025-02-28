/* eslint-disable no-console */
import * as core from '@actions/core'

import {commentAction} from './comment-action'
import {markdownAction} from './markdown-action'

;(async function main() {
    const GITHUB_TARGET = core.getInput('GITHUB_TARGET')
    const PACKAGE_MANAGER = core.getInput('PACKAGE_MANAGER')

    if (GITHUB_TARGET === 'comment') {
        console.log(await commentAction())
    } else if (GITHUB_TARGET === 'markdown') {
        console.log(await markdownAction())
    } else {
        console.log('No target')
    }
})()
