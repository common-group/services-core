import m from 'mithril';

export const AdminHomeBannersEntry = {

    view({attrs}) {
        
        const {
            position,
            title,
            subtitle,
            link,
            cta,
            image
        } = attrs;

        return m('div.card.u-marginbottom-30', [
            m('div.fontsize-larger.u-marginbottom-30', `Posição #${position()}`),
            m('div.w-form', [
                m('div', [
                    m('div.fontsize-base',
                        m('span.fontweight-semibold', 'Título:')
                    ),
                    m('input.text-field.w-input[type="text"]', {
                        oninput: (event) => title(event.target.value),
                        value: title()
                    }),
                    m('div.fontsize-base',
                        m('span.fontweight-semibold', 'Subtítulo:')
                    ),
                    m('input.text-field.w-input[type="text"]', {
                        oninput: (event) => subtitle(event.target.value),
                        value: subtitle()
                    }),
                    m('div.fontsize-base',
                        m('span.fontweight-semibold', 'Link:')
                    ),
                    m('input.text-field.w-input[type="text"]', {
                        oninput: (event) => link(event.target.value),
                        value: link()
                    }),
                    m('div.fontsize-base',
                        m('span.fontweight-semibold', 'CTA:')
                    ),
                    m('input.text-field.w-input[type="text"]', {
                        oninput: (event) => cta(event.target.value),
                        value: cta()
                    }),
                    m('div.fontsize-base',
                        m('span.fontweight-semibold', 'Imagem:')
                    ),
                    m('input.text-field.w-input[type="text"]', {
                        oninput: (event) => image(event.target.value),
                        value: image()
                    })
                ])
            ])
        ]);
    }
};
