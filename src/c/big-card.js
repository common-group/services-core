import m from 'mithril';

const bigCard = {
    view(ctrl, args) {
        const cardClass = '.card.medium.card-terciary.u-marginbottom-30';

        return m(cardClass, [
            m('div.u-marginbottom-30', [
                m('label.fontweight-semibold.fontsize-base', args.label),
                (args.label_hint ? m('.fontsize-small', args.label_hint) : '')
            ]),
            m('div', args.children)
        ]);
    }
}

export default bigCard;
