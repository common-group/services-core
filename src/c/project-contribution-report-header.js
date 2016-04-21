window.c.ProjectContributionReportHeader = ((m, c, _, h) => {
    return {
        view: (cltr, args) => {
            return m('.w-section.dashboard-header', [
                m('.w-container', [
                    m('.w-row', [
                        m('.w-col.w-col-3'),
                        m('.w-col.w-col-6', [
                            m('.fontsize-larger.u-text-center.fontweight-semibold.lineheight-looser.u-marginbottom-30', 'Relatório de apoios')]),
                        m('.w-col.w-col-3')
                    ]),
                    m('.w-form', [
                        m('form', [
                            m('.w-row', [
                                m('.w-col.w-col-4', [
                                    m('.w-row', [
                                        m('.w-col.w-col-6.w-col-small-6.w-col-tiny-6._w-sub-col-middle', [
                                            m('select.w-select.text-field', [
                                                m('option', 'Recompensas'),
                                            ])
                                        ]),
                                        m('.w-col.w-col-6.w-col-small-6.w-col-tiny-6._w-sub-col', [
                                            m('select.w-select.text-field', [
                                                m('option', 'Status do apoio'),
                                            ])
                                        ])
                                    ])
                                ]),
                                m('.w-col.w-col-8', [
                                    m('.w-row', [
                                        m('.w-col.w-col-4._w-sub-col', [
                                            m('input.w-input.text-field[placeholder="Busque por nome ou email do apoiador"][required="required"][type="text"]')
                                        ]),
                                        m('.w-col.w-col-3', [
                                            m('a.btn.btn-medium[href="#"]', 'Buscar')
                                        ]),
                                        m('.w-col.w-col-5.w-clearfix.w-hidden-small.w-hidden-tiny', [
                                            m('.dropdown-list.card.u-radius.dropdown-list-medium.zindex-10.u-margintop-40.absolute-right', {style: {'display': ' block'}}, [
                                                m('.w-form', [
                                                    m('select.w-select.text-field', [
                                                        m('option', 'Recompensas'),
                                                    ]),
                                                    m('input.w-button.btn.btn-small[type="submit"][value="Baixar"]')
                                                ])
                                            ]),
                                            m('a.alt-link.u-right.fontsize-small.lineheight-looser[href="#"]', [
                                                m('span.fa.fa-download', '.'),
                                                ' Baixar relatórios'
                                            ])
                                        ])
                                    ])
                                ])
                            ])
                        ]),
                        m(".w-form-done", [
                            m("p", "Thank you! Your submission has been received!")
                        ]),
                        m(".w-form-fail", [
                            m("p", "Oops! Something went wrong while submitting the form :(")
                        ])
                    ])
                ])
            ]);
        }
    };
}(window.m, window.c, window._, window.c.h));
