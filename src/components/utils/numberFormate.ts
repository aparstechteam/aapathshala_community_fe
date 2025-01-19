export const floorNumberK = (number: number) => {
    return number > 999 ? `${Math.floor(number / 1000)}K+` : number;
}

export const floorNumberD = (number: number) => {
    return number > 9 ? `9+` : number;
}
