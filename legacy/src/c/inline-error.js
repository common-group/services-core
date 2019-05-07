import m from 'mithril';

const inlineError = {
    view: function({attrs}) {
        return m('.fontsize-smaller.text-error.u-marginbottom-20.fa.fa-exclamation-triangle', m('span', m.trust(` ${attrs.message}`)));
    }
};

export default inlineError;
