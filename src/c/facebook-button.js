import m from 'mithril';

const facebookButton = {
    controller(args) {
        const share = () => {
            if (FB) {
                FB.ui({
                    method: args.messenger ? 'send' : 'share',
                    link: args.url,
                    href: args.url,
                });
            }
        };

        return {
            share
        };
    },
    view(ctrl, args) {
        const buttonCss = () => {
            if (args.mobile) {
                return 'w-hidden-main w-hidden-medium u-marginbottom-20 btn btn-medium btn-fb';
            } else if (args.big) {
                return 'btn btn-fb btn-large u-marginbottom-20 w-button';
            } else if (args.medium) {
                return `btn ${args.messenger ? 'btn-messenger' : 'btn-fb'} btn-medium u-marginbottom-20 w-button`;
            }
            return 'btn btn-inline btn-medium btn-terciary u-marginright-20';
        };

        return m('button', {
            class: buttonCss(),
            onclick: ctrl.share
        }, [
            m('span.fa', {
                class: args.messenger ? 'fa-comment' : 'fa-facebook'
            }),
            args.messenger ? ' Messenger' : ' Facebook'
        ]);
    }
};

export default facebookButton;
