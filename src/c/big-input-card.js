import m from 'mithril';

const bigInputCard = {
    view(ctrl, args) {
        const cardClass = args.cardClass || '.w-row.u-marginbottom-30.card.card-terciary.padding-redactor-description.text.optional.project_about_html.field_with_hint';

        return m(cardClass, {style: (args.cardStyle||{})}, [
            m('div', [
                m('label.field-label.fontweight-semibold.fontsize-base', args.label),
                (args.label_hint ? m('label.hint.fontsize-smallest.fontcolor-secondary', args.label_hint) : '')
            ]),
            m('div', args.children)
        ]);
    }
};

export default bigInputCard;
