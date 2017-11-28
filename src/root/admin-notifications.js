import m from 'mithril';

const adminNotifications = {
    controller() {},
    view(ctrl) {
        return m('#notifications-admin', [m('.section',
                m('.w-container',
                    m('.w-row', [
                        m('.w-col.w-col-3'),
                        m('.w-col.w-col-6',
                            m('.w-form', [
                                m('form', [
                                    m('.fontsize-larger.u-marginbottom-10.u-text-center',
                                        'Notificações'
                                    ),
                                    m('select.medium.text-field.w-select', [
                                        m("option[value='']",
                                            'Selecione uma notificação'
                                        ),
                                        m("option[value='First']",
                                            'First Choice'
                                        ),
                                        m("option[value='Second']",
                                            'Second Choice'
                                        ),
                                        m("option[value='Third']",
                                            'Third Choice'
                                        )
                                    ])
                                ])
                            ])
                        ),
                        m('.w-col.w-col-3')
                    ])
                )
            ),
            m('.divider'),
            m('.before-footer.bg-gray.section',
                m('.w-container',
                    m('.w-row', [
                        m('.w-col.w-col-6', [
                            m('.fontsize-base.fontweight-semibold.u-marginbottom-20.u-text-center', [
                                m('span.fa.fa-code',
                                    ''
                                ),
                                'HTML'
                            ]),
                            m('.w-form', [
                                m('form', [
                                    m('.u-marginbottom-20.w-row', [
                                        m('.w-col.w-col-2',
                                            m('label.fontsize-small',
                                                'Label'
                                            )
                                        ),
                                        m('.w-col.w-col-10',
                                            m('.fontsize-small',
                                                'label_identificador'
                                            )
                                        )
                                    ]),
                                    m('.w-row', [
                                        m('.w-col.w-col-2',
                                            m('label.fontsize-small',
                                                'Subject'
                                            )
                                        ),
                                        m('.w-col.w-col-10',
                                            m('input.positive.text-field.w-input')
                                        )
                                    ]),
                                    m('label.fontsize-small', [
                                        'Content',
                                        m('a.alt-link.u-right',
                                            'Ver variáveis'
                                        )
                                    ]),
                                    m('textarea.positive.text-field.w-input')
                                ])
                            ])
                        ]),
                        m('.w-col.w-col-6', [
                            m('.fontsize-base.fontweight-semibold.u-marginbottom-20.u-text-center', [
                                m('span.fa.fa-eye',
                                    ''
                                ),
                                'Visualização'
                            ]),
                            m('.card.u-radius')
                        ])
                    ])
                )
            )
        ]);
    }
};

export default adminNotifications;
