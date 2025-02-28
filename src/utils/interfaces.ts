export interface Bench {
    files: {
        filepath: string
        groups: {
            fullName: string
            benchmarks: {
                id: string
                name: string
                rank: number
                rme: number
                samples: number
                totalTime: number
                min: number
                max: number
                hz: number
                period: number
                mean: number
                variance: number
                sd: number
                sem: number
                df: number
                critical: number
                moe: number
                p75: number
                p99: number
                p995: number
                p999: number
                sampleCount: number
                median: number
            }[]
        }[]
    }[]
}
