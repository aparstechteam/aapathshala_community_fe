export function validateFbLink(link: string): string {
    
    const pattern = /^(https?:\/\/)?(www\.)?facebook\.com\/([a-zA-Z0-9.]+)(\/)?$/;

    if (pattern.test(link)) {
        return link
    } else {
        return ''
    }
}
