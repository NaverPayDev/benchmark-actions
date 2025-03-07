/* eslint-disable @typescript-eslint/no-explicit-any */
import {bench, describe} from 'vitest'

function isNull(value: unknown): value is null {
    return value === null
}
function assign(target: unknown, ...sources: any[]) {
    const to = Object(target)
    if (sources.length === 0) {
        return to
    }
    for (const source of sources) {
        if (!isNull(source)) {
            for (const key of Object.keys(source)) {
                to[key] = source[key]
            }
        }
    }
    return to
}
const largeArray = Array.from({length: 10}, (_, i) => ({[`key${i}`]: i}))
const emptyObjects = Array.from({length: 10}, () => ({}))
const filledObjects = Array.from({length: 10}, (_, i) => ({
    [`key${i}`]: i,
}))
const mixedObjects = [...emptyObjects, ...filledObjects].sort(() => Math.random() - 0.5)
const testCases = [
    largeArray,
    Object.entries(Object.fromEntries(largeArray.map((item, index) => [`key${index}`, index]))), // Object.entries로 변환
    emptyObjects,
    [...largeArray, ...emptyObjects],
    mixedObjects,
]

const ITERATIONS = 9

const _assign = (target: any, ...sources: any[]) => {
    return {
        ...target,
        ...sources,
    }
}

describe('assign performance', () => {
    bench('test1', () => {
        for (let i = 0; i < ITERATIONS; i++) {
            for (const testCase of testCases) {
                assign({}, ...testCase)
            }
        }
    })
    bench('test2', () => {
        for (let i = 0; i < ITERATIONS; i++) {
            for (const testCase of testCases) {
                _assign({}, ...testCase)
            }
        }
    })
})
