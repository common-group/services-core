import m from 'mithril';

const facebookButton = {
    controller (args) {
        const share = () => {
            if (FB){
              FB.ui({
                method: 'share',
                href: args.url,
                });
            }
        }

        return {
            share: share
        };
    },
    view (ctrl, args) {
        return m('button.btn.btn-inline.btn-medium.btn-terciary.u-marginright-20',{
            onclick: ctrl.share
        },[
            m('span.fa.fa-facebook'),
            ' Facebook'
        ]);
    }
};

export default facebookButton;
