import m from 'mithril';

const dashboardMultipleChoiceQuestion = {
    view() {
        return m('.w-clearfix.w-col.w-col-8', [
            m('.card.u-marginbottom-30.u-radius.w-form', [
                m(".dashboard-question", [
                    m('.w-row', [
                        m('.w-col.w-col-4',
                            m("label.fontsize-smaller[for='name-3']",
                                'Pergunta'
                            )
                        ),
                        m('.w-col.w-col-8',
                            m("input.positive.text-field.w-input[data-name='Name 3'][id='name-3'][maxlength='256'][name='name-3'][type='text']")
                        )
                    ]),
                    m('.w-row', [
                        m('.w-col.w-col-4',
                            m("label.fontsize-smaller[for='name-3']",
                                'Descrição'
                            )
                        ),
                        m('.w-col.w-col-8',
                            m("input.positive.text-field.w-input[data-name='Name 4'][id='name-4'][maxlength='256'][name='name-4'][type='text']")
                        )
                    ]),
                    m('.w-row', [
                        m('.w-col.w-col-4',
                            m("label.fontsize-smaller[for='name-3']",
                                'Opções'
                            )
                        ),
                        m('.w-col.w-col-8', [
                            m('.w-row', [
                                m('.fa.fa-circle-o.fontcolor-terciary.prefix.u-text-center.w-col.w-col-1.w-col-medium-1.w-col-small-1.w-col-tiny-1'),
                                m('.w-col.w-col-10.w-col-medium-10.w-col-small-10.w-col-tiny-10',
                                    m("input.positive.text-field.w-input[id='field-2'][maxlength='256'][name='field-2'][placeholder='Opção 1'][required='required'][type='text']")
                                ),
                                m('.w-col.w-col-1.w-col-medium-1.w-col-small-1.w-col-tiny-1')
                            ]),
                            m('.w-row', [
                                m('.fa.fa-circle-o.fontcolor-terciary.prefix.u-text-center.w-col.w-col-1.w-col-medium-1.w-col-small-1.w-col-tiny-1'),
                                m('.w-col.w-col-10.w-col-medium-10.w-col-small-10.w-col-tiny-10',
                                    m("input.positive.text-field.w-input[data-name='Field 3'][id='field-3'][maxlength='256'][name='field-3'][placeholder='Opção 2'][required='required'][type='text']")
                                ),
                                m('.w-col.w-col-1.w-col-medium-1.w-col-small-1.w-col-tiny-1',
                                    m("button.btn.btn-medium.btn-no-border.btn-terciary.fa.fa-trash")
                                )
                            ]),
                            m('.w-row', [
                                m('.w-col.w-col-1.w-col-medium-1.w-col-small-1.w-col-tiny-1'),
                                m('.w-col.w-col-11.w-col-medium-11.w-col-small-11.w-col-tiny-11',
                                    m("a.fontcolor-secondary.fontsize-smallest.link-hidden[href='#']",
                                        'Adicionar mais uma opção'
                                    )
                                )
                            ])
                        ])
                    ])
                ])
            ]),
            m("button.btn.btn-inline.btn-no-border.btn-small.btn-terciary.fa.fa-lg.fa-trash.u-right")
        ]);
    }
};

export default dashboardMultipleChoiceQuestion;