import m from 'mithril';
import _ from 'underscore';
import postgrest from 'mithril-postgrest';
import models from '../models';
import h from '../h';
import projectDashboardMenu from '../c/project-dashboard-menu';
import projectsContributionReportVM from '../vms/projects-contribution-report-vm';

const projectSubscriptionReport = {
    controller(args) {
        const filterVM = projectsContributionReportVM,
            project = m.prop([{}]);

        filterVM.project_id(args.project_id);

        const lProject = postgrest.loaderWithToken(models.projectDetail.getPageOptions({
            project_id: `eq.${filterVM.project_id()}`
        }));

        lProject.load().then((data) => {
            project(data);
        });

        return {
            filterVM,
            lProject,
            project
        };
    },
    view(ctrl) {
        if (!ctrl.lProject()) {
            return m('div', [
                m.component(projectDashboardMenu, {
                    project: m.prop(_.first(ctrl.project()))
                }),
                m('.dashboard-header',
                    m('.w-container',
                        m('.w-row', [
                            m('.w-col.w-col-3'),
                            m('.w-col.w-col-6',
                                m('.fontsize-larger.fontweight-semibold.lineheight-looser.u-marginbottom-30.u-text-center',
                                    'Base de assinantes'
                                )
                            ),
                            m('.w-col.w-col-3')
                        ])
                    )
                ),
                m('.divider.u-margintop-30'),
                m('.before-footer.bg-gray.section', [
                    m('.w-container', [
                        m('div',
                            m('.w-row', [
                                m('.u-marginbottom-20.u-text-center-small-only.w-col.w-col-7',
                                    m('.w-inline-block.fontsize-base.u-marginright-10', [
                                        m('span.fontweight-semibold',
                                            '99999'
                                        ),
                                        ' assinantes',
                                        m.trust('&nbsp;')
                                    ])
                                ),
                                m('.w-col.w-col-5',
                                    m("a.alt-link.fontsize-small.u-right[data-ix='show-dropdown'][href='#']", [
                                        m('span.fa.fa-download',
                                            '.'
                                        ),
                                        ' Baixar relatórios'
                                    ])
                                )
                            ])
                        ),
                        m('.u-marginbottom-60', [
                            m('.card.card-secondary.fontsize-smallest.fontweight-semibold.lineheight-tighter.u-marginbottom-10',
                                m('.w-row', [
                                    m('.table-col.w-col.w-col-3',
                                        m('div',
                                            'Assinante'
                                        )
                                    ),
                                    m('.table-col.w-col.w-col-3',
                                        m('div',
                                            'Recompensa'
                                        )
                                    ),
                                    m('.table-col.w-col.w-col-1',
                                        m('div',
                                            'Apoio mensal'
                                        )
                                    ),
                                    m('.table-col.w-col.w-col-1',
                                        m('div',
                                            'Total apoiado'
                                        )
                                    ),
                                    m('.table-col.w-col.w-col-2',
                                        m('div',
                                            'Último apoio'
                                        )
                                    ),
                                    m('.table-col.w-col.w-col-2',
                                        m('div',
                                            'Status da Assinatura'
                                        )
                                    )
                                ])
                            ),
                            m('.fontsize-small', [
                                m('div',
                                    m('.card.table-row',
                                        m('.w-row', [
                                            m('.table-col.w-col.w-col-3',
                                                m('.w-row', [
                                                    m('.w-col.w-col-3',
                                                        m("img.u-marginbottom-10.user-avatar[src='https://daks2k3a4ib2z.cloudfront.net/5991cfb722e8860001b12d51/5991cfb722e8860001b12e29_humberto-avatar.JPG']")
                                                    ),
                                                    m('.w-col.w-col-9', [
                                                        m('.fontsize-smaller.fontweight-semibold.lineheight-tighter',
                                                            'Humberto Oliveira'
                                                        ),
                                                        m('.fontcolor-secondary.fontsize-smallest',
                                                            'email@email.com'
                                                        )
                                                    ])
                                                ])
                                            ),
                                            m('.table-col.w-col.w-col-3',
                                                m('.fontsize-smaller',
                                                    'R$10: Acesso a alguma coisa e...'
                                                )
                                            ),
                                            m('.table-col.w-col.w-col-1', [
                                                m('.fontsize-smaller',
                                                    'R$10'
                                                ),
                                                m('.fontcolor-secondary.fontsize-mini.fontweight-semibold.lineheight-tightest', [
                                                    m('span.fa.fa-barcode',
                                                        '.'
                                                    ),
                                                    ' Boleto'
                                                ])
                                            ]),
                                            m('.w-col.w-col-1', [
                                                m('.fontsize-smaller',
                                                    'R$100'
                                                ),
                                                m('.fontcolor-secondary.fontsize-mini.fontweight-semibold.lineheight-tightest',
                                                    '10 meses'
                                                )
                                            ]),
                                            m('.w-col.w-col-2',
                                                m('.fontsize-smaller',
                                                    '10/01/2017'
                                                )
                                            ),
                                            m('.w-col.w-col-2',
                                                m('.fontsize-smaller', [
                                                    m('span.fa.fa-circle.text-success',
                                                        '.'
                                                    ),
                                                    ' Ativa'
                                                ])
                                            )
                                        ])
                                    )
                                ),
                                m('.card',
                                    m('.w-row', [
                                        m('.table-col.w-col.w-col-3',
                                            m('.w-row', [
                                                m('.w-col.w-col-3',
                                                    m("img.u-marginbottom-10.user-avatar[src='https://daks2k3a4ib2z.cloudfront.net/5991cfb722e8860001b12d51/5991cfb722e8860001b12e29_humberto-avatar.JPG']")
                                                ),
                                                m('.w-col.w-col-9', [
                                                    m('.fontsize-smaller.fontweight-semibold.lineheight-tighter',
                                                        'Humberto Oliveira'
                                                    ),
                                                    m('.fontcolor-secondary.fontsize-smallest',
                                                        'email@email.com'
                                                    )
                                                ])
                                            ])
                                        ),
                                        m('.table-col.w-col.w-col-3',
                                            m('.fontsize-smaller',
                                                'R$10: Acesso a alguma coisa e...'
                                            )
                                        ),
                                        m('.table-col.w-col.w-col-1', [
                                            m('.fontsize-smaller',
                                                'R$15'
                                            ),
                                            m('.fontcolor-secondary.fontsize-mini.fontweight-semibold.lineheight-tightest', [
                                                m('span.fa.fa-barcode',
                                                    '.'
                                                ),
                                                ' Boleto'
                                            ])
                                        ]),
                                        m('.w-col.w-col-1', [
                                            m('.fontsize-smaller',
                                                'R$0'
                                            ),
                                            m('.fontcolor-secondary.fontsize-mini.fontweight-semibold.lineheight-tightest',
                                                '0 meses'
                                            )
                                        ]),
                                        m('.w-col.w-col-2',
                                            m('.fontsize-smaller')
                                        ),
                                        m('.w-col.w-col-2', [
                                            m('.fontsize-smaller', [
                                                m('span.fa.fa-circle.text-waiting',
                                                    '.'
                                                ),
                                                ' Iniciada'
                                            ]),
                                            m('.fontcolor-secondary.fontsize-mini.fontweight-semibold.lineheight-tightest',
                                                'em 10/01/2017'
                                            )
                                        ])
                                    ])
                                ),
                                m('.card',
                                    m('.w-row', [
                                        m('.table-col.w-col.w-col-3',
                                            m('.w-row', [
                                                m('.w-col.w-col-3',
                                                    m("img.u-marginbottom-10.user-avatar[src='https://daks2k3a4ib2z.cloudfront.net/5991cfb722e8860001b12d51/5991cfb722e8860001b12e29_humberto-avatar.JPG']")
                                                ),
                                                m('.w-col.w-col-9', [
                                                    m('.fontsize-smaller.fontweight-semibold.lineheight-tighter',
                                                        'Humberto Oliveira'
                                                    ),
                                                    m('.fontcolor-secondary.fontsize-smallest',
                                                        'email@email.com'
                                                    )
                                                ])
                                            ])
                                        ),
                                        m('.table-col.w-col.w-col-3',
                                            m('.fontsize-smaller',
                                                'R$10: Acesso a alguma coisa e...'
                                            )
                                        ),
                                        m('.table-col.w-col.w-col-1', [
                                            m('.fontsize-smaller',
                                                'R$15'
                                            ),
                                            m('.fontcolor-secondary.fontsize-mini.fontweight-semibold.lineheight-tightest', [
                                                m('span.fa.fa-barcode',
                                                    '.'
                                                ),
                                                ' Boleto'
                                            ])
                                        ]),
                                        m('.w-col.w-col-1', [
                                            m('.fontsize-smaller',
                                                'R$150'
                                            ),
                                            m('.fontcolor-secondary.fontsize-mini.fontweight-semibold.lineheight-tightest',
                                                '10 meses'
                                            )
                                        ]),
                                        m('.w-col.w-col-2',
                                            m('.fontsize-smaller',
                                                '10/01/2017'
                                            )
                                        ),
                                        m('.w-col.w-col-2',
                                            m('.fontsize-smaller', [
                                                m('span.fa.fa-circle.text-success',
                                                    '.'
                                                ),
                                                ' Ativa'
                                            ])
                                        )
                                    ])
                                ),
                                m('.card',
                                    m('.w-row', [
                                        m('.table-col.w-col.w-col-3',
                                            m('.w-row', [
                                                m('.w-col.w-col-3',
                                                    m("img.u-marginbottom-10.user-avatar[src='https://daks2k3a4ib2z.cloudfront.net/5991cfb722e8860001b12d51/5991cfb722e8860001b12e29_humberto-avatar.JPG']")
                                                ),
                                                m('.w-col.w-col-9', [
                                                    m('.fontsize-smaller.fontweight-semibold.lineheight-tighter',
                                                        'Humberto Oliveira'
                                                    ),
                                                    m('.fontcolor-secondary.fontsize-smallest',
                                                        'email@email.com'
                                                    )
                                                ])
                                            ])
                                        ),
                                        m('.table-col.w-col.w-col-3',
                                            m('.fontsize-smaller',
                                                'R$10: Acesso a alguma coisa e...'
                                            )
                                        ),
                                        m('.table-col.w-col.w-col-1', [
                                            m('.fontsize-smaller',
                                                'R$15'
                                            ),
                                            m('.fontcolor-secondary.fontsize-mini.fontweight-semibold.lineheight-tightest', [
                                                m('span.fa.fa-barcode',
                                                    '.'
                                                ),
                                                ' Boleto'
                                            ])
                                        ]),
                                        m('.w-col.w-col-1', [
                                            m('.fontsize-smaller',
                                                'R$150'
                                            ),
                                            m('.fontcolor-secondary.fontsize-mini.fontweight-semibold.lineheight-tightest',
                                                '10 meses'
                                            )
                                        ]),
                                        m('.w-col.w-col-2',
                                            m('.fontsize-smaller',
                                                '10/01/2017'
                                            )
                                        ),
                                        m('.w-col.w-col-2',
                                            m('.fontsize-smaller', [
                                                m('span.fa.fa-circle.text-error',
                                                    '.'
                                                ),
                                                ' Inativa'
                                            ])
                                        )
                                    ])
                                ),
                                m('.card',
                                    m('.w-row', [
                                        m('.table-col.w-col.w-col-3',
                                            m('.w-row', [
                                                m('.w-col.w-col-3',
                                                    m("img.u-marginbottom-10.user-avatar[src='https://daks2k3a4ib2z.cloudfront.net/5991cfb722e8860001b12d51/5991cfb722e8860001b12e29_humberto-avatar.JPG']")
                                                ),
                                                m('.w-col.w-col-9', [
                                                    m('.fontsize-smaller.fontweight-semibold.lineheight-tighter',
                                                        'Humberto Oliveira'
                                                    ),
                                                    m('.fontcolor-secondary.fontsize-smallest',
                                                        'email@email.com'
                                                    )
                                                ])
                                            ])
                                        ),
                                        m('.table-col.w-col.w-col-3',
                                            m('.fontsize-smaller',
                                                'R$10: Acesso a alguma coisa e...'
                                            )
                                        ),
                                        m('.table-col.w-col.w-col-1', [
                                            m('.fontsize-smaller',
                                                'R$15'
                                            ),
                                            m('.fontcolor-secondary.fontsize-mini.fontweight-semibold.lineheight-tightest', [
                                                m('span.fa.fa-barcode',
                                                    '.'
                                                ),
                                                ' Boleto'
                                            ])
                                        ]),
                                        m('.w-col.w-col-1', [
                                            m('.fontsize-smaller',
                                                'R$150'
                                            ),
                                            m('.fontcolor-secondary.fontsize-mini.fontweight-semibold.lineheight-tightest',
                                                '10 meses'
                                            )
                                        ]),
                                        m('.w-col.w-col-2',
                                            m('.fontsize-smaller',
                                                '10/01/2017'
                                            )
                                        ),
                                        m('.w-col.w-col-2',
                                            m('.fontsize-smaller', [
                                                m('span.fa.fa-times-circle.text-error',
                                                    '.'
                                                ),
                                                ' Cancelada'
                                            ])
                                        )
                                    ])
                                ),
                                m('div', [
                                    m('.card.table-row',
                                        m('.w-row', [
                                            m('.table-col.w-col.w-col-3',
                                                m('.w-row', [
                                                    m('.w-col.w-col-3',
                                                        m("img.u-marginbottom-10.user-avatar[src='https://daks2k3a4ib2z.cloudfront.net/5991cfb722e8860001b12d51/5991cfb722e8860001b12e29_humberto-avatar.JPG']")
                                                    ),
                                                    m('.w-col.w-col-9', [
                                                        m('.fontsize-smaller.fontweight-semibold.lineheight-tighter',
                                                            'Humberto Oliveira'
                                                        ),
                                                        m('.fontcolor-secondary.fontsize-smallest',
                                                            'email@email.com'
                                                        )
                                                    ])
                                                ])
                                            ),
                                            m('.table-col.w-col.w-col-3',
                                                m('.fontsize-smaller',
                                                    'R$10: Acesso a alguma coisa e...'
                                                )
                                            ),
                                            m('.table-col.w-col.w-col-1', [
                                                m('.fontsize-smaller',
                                                    'R$10'
                                                ),
                                                m('.fontcolor-secondary.fontsize-mini.fontweight-semibold.lineheight-tightest', [
                                                    m('span.fa.fa-credit-card',
                                                        '.'
                                                    ),
                                                    m.trust('&nbsp;'),
                                                    'CC'
                                                ])
                                            ]),
                                            m('.w-col.w-col-1', [
                                                m('.fontsize-smaller',
                                                    'R$100'
                                                ),
                                                m('.fontcolor-secondary.fontsize-mini.fontweight-semibold.lineheight-tightest',
                                                    '10 meses'
                                                )
                                            ]),
                                            m('.w-col.w-col-2',
                                                m('.fontsize-smaller',
                                                    '10/01/2017'
                                                )
                                            ),
                                            m('.w-col.w-col-2',
                                                m('.fontsize-smaller', [
                                                    m('span.fa.fa-circle.text-success',
                                                        '.'
                                                    ),
                                                    ' Ativa'
                                                ])
                                            )
                                        ])
                                    ),
                                    m('.card.table-row',
                                        m('.w-row', [
                                            m('.table-col.w-col.w-col-3',
                                                m('.w-row', [
                                                    m('.w-col.w-col-3',
                                                        m("img.u-marginbottom-10.user-avatar[src='https://daks2k3a4ib2z.cloudfront.net/5991cfb722e8860001b12d51/5991cfb722e8860001b12e29_humberto-avatar.JPG']")
                                                    ),
                                                    m('.w-col.w-col-9', [
                                                        m('.fontsize-smaller.fontweight-semibold.lineheight-tighter',
                                                            'Humberto Oliveira'
                                                        ),
                                                        m('.fontcolor-secondary.fontsize-smallest',
                                                            'email@email.com'
                                                        )
                                                    ])
                                                ])
                                            ),
                                            m('.table-col.w-col.w-col-3',
                                                m('.fontsize-smaller',
                                                    'R$10: Acesso a alguma coisa e...'
                                                )
                                            ),
                                            m('.table-col.w-col.w-col-1', [
                                                m('.fontsize-smaller',
                                                    'R$10'
                                                ),
                                                m('.fontcolor-secondary.fontsize-mini.fontweight-semibold.lineheight-tightest', [
                                                    m('span.fa.fa-credit-card',
                                                        '.'
                                                    ),
                                                    m.trust('&nbsp;'),
                                                    'CC'
                                                ])
                                            ]),
                                            m('.w-col.w-col-1', [
                                                m('.fontsize-smaller',
                                                    'R$100'
                                                ),
                                                m('.fontcolor-secondary.fontsize-mini.fontweight-semibold.lineheight-tightest',
                                                    '10 meses'
                                                )
                                            ]),
                                            m('.w-col.w-col-2',
                                                m('.fontsize-smaller',
                                                    '10/01/2017'
                                                )
                                            ),
                                            m('.w-col.w-col-2',
                                                m('.fontsize-smaller', [
                                                    m('span.fa.fa-circle.text-error',
                                                        '.'
                                                    ),
                                                    ' Inativa'
                                                ])
                                            )
                                        ])
                                    )
                                ]),
                                m('div',
                                    m('.card.table-row',
                                        m('.w-row', [
                                            m('.table-col.w-col.w-col-3',
                                                m('.w-row', [
                                                    m('.w-col.w-col-3',
                                                        m("img.u-marginbottom-10.user-avatar[src='https://daks2k3a4ib2z.cloudfront.net/5991cfb722e8860001b12d51/5991cfb722e8860001b12e29_humberto-avatar.JPG']")
                                                    ),
                                                    m('.w-col.w-col-9', [
                                                        m('.fontsize-smaller.fontweight-semibold.lineheight-tighter',
                                                            'Humberto Oliveira'
                                                        ),
                                                        m('.fontcolor-secondary.fontsize-smallest',
                                                            'email@email.com'
                                                        )
                                                    ])
                                                ])
                                            ),
                                            m('.table-col.w-col.w-col-3',
                                                m('.fontsize-smaller',
                                                    'R$10: Acesso a alguma coisa e...'
                                                )
                                            ),
                                            m('.table-col.w-col.w-col-1', [
                                                m('.fontsize-smaller',
                                                    'R$10'
                                                ),
                                                m('.fontcolor-secondary.fontsize-mini.fontweight-semibold.lineheight-tightest', [
                                                    m('span.fa.fa-credit-card',
                                                        '.'
                                                    ),
                                                    m.trust('&nbsp;'),
                                                    'CC'
                                                ])
                                            ]),
                                            m('.w-col.w-col-1', [
                                                m('.fontsize-smaller',
                                                    'R$100'
                                                ),
                                                m('.fontcolor-secondary.fontsize-mini.fontweight-semibold.lineheight-tightest',
                                                    '10 meses'
                                                )
                                            ]),
                                            m('.w-col.w-col-2',
                                                m('.fontsize-smaller',
                                                    '10/01/2017'
                                                )
                                            ),
                                            m('.w-col.w-col-2',
                                                m('.fontsize-smaller', [
                                                    m('span.fa.fa-circle.text-success',
                                                        '.'
                                                    ),
                                                    ' Ativa'
                                                ])
                                            )
                                        ])
                                    )
                                )
                            ])
                        ])
                    ]),
                    m('.bg-gray.section',
                        m('.w-container',
                            m('.u-marginbottom-60.w-row', [
                                m('.w-col.w-col-5'),
                                m('.w-col.w-col-2',
                                    m("a.btn.btn-medium.btn-terciary[href='#']",
                                        'Carregar mais'
                                    )
                                ),
                                m('.w-col.w-col-5')
                            ])
                        )
                    )
                ])
            ]);
        }
        return m('', h.loader());
    }
};

export default projectSubscriptionReport;
