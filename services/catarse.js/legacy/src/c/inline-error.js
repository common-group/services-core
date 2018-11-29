import m from 'mithril';

const inlineError = {
    view: function(ctrl, args) {
        return m('.fontsize-smaller.text-error.u-marginbottom-20.fa.fa-exclamation-triangle', m('span', m.trust(` ${args.message}`)));
    }
};

export default inlineError;
