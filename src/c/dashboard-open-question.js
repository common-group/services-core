import m from 'mithril';

const dashboardOpenQuestion = {
    view(ctrl, args) {
        const { question, index } = args;
        return m('.card.u-marginbottom-30.u-radius.w-form', [
            m('div', [
                m('.w-row', [
                    m('.w-col.w-col-4',
                        m('label.fontsize-smaller[for="name-3"]',
                            'Pergunta'
                        )
                    ),
                    m('.w-col.w-col-8',
                        m('input.positive.text-field.w-input[name="question"][type="text"]', {
                            name: `reward[surveys_attributes][questions][${index}][question]`,
                            onchange: m.withAttr('value', newValue => question.question = newValue),
                            value: question.question
                        })
                    )
                ]),
                m('.w-row', [
                    m('.w-col.w-col-4',
                        m('label.fontsize-smaller[for="name-3"]',
                            'Descrição'
                        )
                    ),
                    m('.w-col.w-col-8',
                        m('input.positive.text-field.w-input[type="text"]', {
                            name: `reward[surveys_attributes][questions][${index}][description]`,
                            onchange: m.withAttr('value', newValue => question.description = newValue),
                            value: question.description
                        })
                    )
                ])
            ])
        ]);
    }
};

export default dashboardOpenQuestion;
