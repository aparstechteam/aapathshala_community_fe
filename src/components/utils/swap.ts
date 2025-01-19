export function swap<T>(arr: T[], i: number, j: number): T[] {
    if (arr.length > 1) {

        [arr[i], arr[j]] = [arr[j], arr[i]];
        return arr
    }
    return arr
}