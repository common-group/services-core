import m from 'mithril';

const inlineError = {
    view: function({state, attrs}) {
        return m('.fontsize-smaller.text-error.u-marginbottom-20.fa.fa-exclamation-triangle', m('span', ` ${args.message}`));
    }
};

export default inlineError;
