export enum SocialMediaShareType {
    Facebook = 'Facebook',
    Messenger = 'Messenger'
}

export function share(shareType: SocialMediaShareType, shareLink: string) {
    let method = 'share'
    let link = shareLink
    switch (shareType) {
        case SocialMediaShareType.Facebook:
            method = 'share'
            link = `${shareLink}?ref=ctrse_project_share&utm_source=facebook.com&utm_medium=social&utm_campaign=ctrse_project_share`
            break

        case SocialMediaShareType.Messenger:
            method = 'send'
            link = `${shareLink}?ref=ctrse_project_share&utm_source=facebook_messenger&utm_medium=social&utm_campaign=ctrse_project_share`
            break

        default:
            throw new Error(`Trying to share unknown type: ${shareType}`)
    }

    if (shareType == SocialMediaShareType.Facebook || shareType === SocialMediaShareType.Messenger) {
        window.open(`http://www.facebook.com/share.php?u=${link}`, 'popUpWindow', 'height=500,width=500,left=100,top=100,resizable=yes,scrollbars=yes,toolbar=yes,menubar=no,location=no,directories=no, status=yes');
        return false;
        // if (window.FB) {
        //     window.FB.ui({
        //         method,
        //         link,
        //         href: link,
        //         display: 'popup',
        //     });
        // }
    }
}
