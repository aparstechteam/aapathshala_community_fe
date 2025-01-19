export function source(array: string[]) {
    const result = [array.map((x) => !!x && ` ${x}`)].filter(Boolean).join(", ")
    return `[${result}]`
}