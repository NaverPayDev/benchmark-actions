/* eslint-disable no-console */
import * as core from '@actions/core'

import {commentAction} from './comment-action'
import {markdownAction} from './markdown-action'

;(async function main() {
    const TARGET = core.getInput('TARGET')
    const PACKAGE_MANAGER = core.getInput('PACKAGE_MANAGER')

    if (TARGET === 'comment') {
        console.log(await commentAction())
    } else if (TARGET === 'markdown') {
        console.log(await markdownAction())
    } else {
        console.log('No target')
    }
})()
