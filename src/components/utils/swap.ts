export function swap<T>(arr: T[], i: number, j: number, k: number): T[] {
    if (arr.length > 1) {
        const a = [arr[i], arr[j], arr[k]]
        return a
    }
    return arr
}