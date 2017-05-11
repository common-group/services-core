import m from 'mithril';

const inputCard = {
    view(ctrl, args) {
        const cardClass = args.cardClass || '.w-row.u-marginbottom-30.card.card-terciary',
            onclick = args.onclick || Function.prototype;

        return m(cardClass, { onclick }, [
            m('.w-col.w-col-5.w-sub-col', [
                m('label.field-label.fontweight-semibold', args.label),
                (args.label_hint ? m('label.hint.fontsize-smallest.fontcolor-secondary', args.label_hint) : '')
            ]),
            m('.w-col.w-col-7.w-sub-col', args.children)
        ]);
    }
};

export default inputCard;
