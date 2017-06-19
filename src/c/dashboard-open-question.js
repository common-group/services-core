import m from 'mithril';

const dashboardOpenQuestion = {
    view(){
        return m('.card.u-marginbottom-30.u-radius.w-form', [
            m('div', [
                m('.w-row', [
                    m('.w-col.w-col-4',
                        m('label.fontsize-smaller[for="name-3"]',
                            'Pergunta'
                        )
                    ),
                    m('.w-col.w-col-8',
                        m('input.positive.text-field.w-input[data-name="Name 5"][id="name-5"][maxlength="256"][name="name-5"][type="text"]')
                    )
                ]),
                m('.w-row', [
                    m('.w-col.w-col-4',
                        m('label.fontsize-smaller[for="name-3"]',
                            'Descrição'
                        )
                    ),
                    m('.w-col.w-col-8',
                        m("input.positive.text-field.w-input[data-name='Name 6'][id='name-6'][maxlength='256'][name='name-6'][type='text']")
                    )
                ])
            ])
        ]);
    }
};

export default dashboardOpenQuestion;