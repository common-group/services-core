import m from 'mithril';

export default class inlineError implements m.Component {
    view({attrs}) {
        return attrs.message && m('.fontsize-smaller.text-error.u-marginbottom-20.fa.fa-exclamation-triangle', m('span', m.trust(` ${attrs.message}`)))
    }
}