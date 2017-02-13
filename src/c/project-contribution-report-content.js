import m from 'mithril';
import _ from 'underscore';
import h from '../h';
import projectContributionReportContentCard from './project-contribution-report-content-card';

const projectContributionReportContent = {
    controller(args) {
        const showFilters = h.toggleProp(false, true),
            showSelectedMenu = h.toggleProp(false, true),
            selectedAny = m.prop(false),
            showSuccess = m.prop(false),
            selectedContributions = m.prop([]),
            updateStatus = (status) => {
                return m.request({
                    method: 'PUT',
                    url: `/projects/${args.project().project_id}/contributions/update_status.json`,
                    data: {
                        contributions: selectedContributions(),
                        delivery_status: status
                    },
                    config: h.setCsrfToken
                }).then(() => {
                    showSuccess(true);
                    showSelectedMenu.toggle();
                    m.redraw();
                }).catch((err) => {
                    m.redraw();
                });

            },
            filterStatus = (status) => {
                args.filterVM.delivery_status(status);
                args.submit();
                showFilters.toggle();
            };

        return {
            updateStatus: updateStatus,
            showFilters: showFilters,
            showSelectedMenu: showSelectedMenu,
            selectedAny: selectedAny,
            selectedContributions: selectedContributions,
            filterStatus: filterStatus
        };
    },
    view(ctrl, args) {
        const list = args.list;
        return m('.w-section.bg-gray.before-footer.section', [
            m('.w-container', [
                m('.w-row.u-marginbottom-20', [
                    m('.w-col.w-col-9.w-col-small-6.w-col-tiny-6', [
                        m('.fontsize-base', [
                            m('span.fontweight-semibold', (list.isLoading() ? '' : list.total())),
                            ' apoios'
                        ]),
                        //m(".fontsize-large.fontweight-semibold", "R$ 12.000,00")
                    ]),
                    /*
                     TODO: ordering filter template
                    m(".w-col.w-col-3.w-col-small-6.w-col-tiny-6", [
                        m(".w-form", [
                            m("form[data-name='Email Form 5'][id='email-form-5'][name='email-form-5']", [
                                m(".fontsize-smallest.fontcolor-secondary", "Ordenar por:"),
                                m("select.w-select.text-field.positive.fontsize-smallest[id='field-9'][name='field-9']", [
                                    m("option[value='']", "Data (recentes para antigos)"),
                                    m("option[value='']", "Data (antigos para recentes)"),
                                    m("option[value='']", "Valor (maior para menor)"),
                                    m("option[value='First']", "Valor (menor para maior)")
                                ])
                            ])
                        ])
                    ])*/
                ]),
                m('.menu-actions',
                    m('.w-row', [
                        m('.w-col.w-col-2', [
                            m('.btn.btn-medium.btn-terciary', {
                                onclick: ctrl.showFilters.toggle
                            }, [
                                m(`.checkbox-menu${ctrl.selectedAny() ? '.checkbox-menu-partial-selected' : ''}`),
                                m('._w-inline-block.fontsize-smaller', [
                                    'Selecionar ',
                                    m.trust('&nbsp;'),
                                    m('span.fa.fa-sort-desc',
                                        ''
                                    )
                                ])
                            ]),
                            (ctrl.showFilters() ? m('.card.dropdown-list.dropdown-list-medium.u-radius.zindex-10[id=\'transfer\']', [
                                m('a.dropdown-link.fontsize-smaller[href=\'#\']', {
                                    onclick: () => {
                                        ctrl.filterStatus('');
                                    }
                                }, [
                                    'Todos ',
                                    m('span.badge',
                                        '125'
                                    )
                                ]),
                                m('a.dropdown-link.fontsize-smaller[href=\'#\']',
                                    'Nenhum'
                                ),
                                m('a.dropdown-link.fontsize-smaller[href=\'#\']', {
                                    onclick: () => {
                                        ctrl.filterStatus('delivered');
                                    }
                                }, [
                                    'Enviadas ',
                                    m('span.badge',
                                        '45'
                                    )
                                ]),
                                m('a.dropdown-link.fontsize-smaller', {
                                    onclick: () => {
                                        ctrl.filterStatus('received');
                                    }
                                }, [
                                    'Recebidas ',
                                    m('span.badge',
                                        '45'
                                    )
                                ]),
                                m('a.dropdown-link.fontsize-smaller', {
                                        onclick: () => {
                                            ctrl.filterStatus('undelivered');
                                        }
                                    },

                                    [
                                        'Não enviadas ',
                                        m('span.badge',
                                            '23'
                                        )
                                    ]
                                ),
                                m('a.dropdown-link.fontsize-smaller', {
                                    onclick: () => {
                                        ctrl.filterStatus('error');
                                    }
                                }, [
                                    'Erro no envio ',
                                    m('span.badge',
                                        '2'
                                    )
                                ])
                            ]) : '')
                        ]),
                        (ctrl.selectedAny() ?
                            m('.w-col.w-col-3', [
                                m('button.btn.btn-medium.btn-terciary.w-button', {
                                        onclick: ctrl.showSelectedMenu.toggle
                                    },
                                    'Marcar recompensa como'
                                ),
                                (ctrl.showSelectedMenu() ?
                                    m('.card.dropdown-list.dropdown-list-medium.u-radius.zindex-10[id=\'transfer\']', [
                                        m('a.dropdown-link.fontsize-smaller', {
                                                onclick: () => {
                                                    ctrl.updateStatus('delivered');
                                                }
                                            },
                                            'Enviada'
                                        ),
                                        m('a.dropdown-link.fontsize-smaller', {
                                                onclick: () => {
                                                    ctrl.updateStatus('error');
                                                }
                                            },
                                            'Erro no envio'
                                        )
                                    ]) : '')
                            ]) : ''),
                        m('.w-col.w-col-7')
                    ])
                ),
                _.map(list.collection(), (item) => {
                    const contribution = m.prop(item);
                    return m.component(projectContributionReportContentCard, {
                        project: args.project,
                        contribution: contribution,
                        selectedContributions: ctrl.selectedContributions,
                        selectedAny: ctrl.selectedAny
                    });
                })
            ]),
            m('.w-section.section.bg-gray', [
                m('.w-container', [
                    m('.w-row.u-marginbottom-60', [
                        m('.w-col.w-col-2.w-col-push-5', [
                            (!list.isLoading() ?
                                (list.isLastPage() ? '' : m('button#load-more.btn.btn-medium.btn-terciary', {
                                    onclick: list.nextPage
                                }, 'Carregar mais')) : h.loader())
                        ])
                    ])

                ])
            ])

        ]);
    }
};

export default projectContributionReportContent;
