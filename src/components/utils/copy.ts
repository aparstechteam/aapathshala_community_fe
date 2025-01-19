
export const copyLink = (link: string) => {
    if (typeof window !== 'undefined') {
        navigator.clipboard.writeText(`${window.location.origin}${link}`);
        // toast({
        //     title: 'Link copied',
        //     description: 'Paste the link in your Chrome browser',
        // });
    }
};