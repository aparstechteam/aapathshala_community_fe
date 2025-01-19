export const accessToken = () => localStorage.getItem('accessToken')
export const refreshToken = () => localStorage.getItem('refreshToken')
export const groups = () => {
    if (typeof window === 'undefined') return []
    const groups = JSON.parse(localStorage.getItem('groups') || '[]')
    return groups
}