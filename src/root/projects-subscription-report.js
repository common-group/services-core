import m from 'mithril';
import _ from 'underscore';
import { catarse, commonPayment } from '../api';
import models from '../models';
import h from '../h';
import loadMoreBtn from '../c/load-more-btn';
import projectDashboardMenu from '../c/project-dashboard-menu';
import dashboardSubscriptionCard from '../c/dashboard-subscription-card';
import projectsContributionReportVM from '../vms/projects-contribution-report-vm';

const projectSubscriptionReport = {
    controller(args) {
        const filterVM = projectsContributionReportVM,
            error = m.prop(false),
            loader = m.prop(true),
            handleError = () => {
                error(true);
                loader(false);
                m.redraw();
            },
            subscriptions = commonPayment.paginationVM(models.userSubscription, 'created_at.desc', {
                Prefer: 'count=exact'
            }),
            contextSubVM = catarse.filtersVM({
                status: 'in'
            }),
            project = m.prop([{}]);

        contextSubVM.status(['started', 'active', 'inactive', 'canceled', 'error']);
        filterVM.project_id(args.project_id);

        const lProject = catarse.loaderWithToken(models.projectDetail.getPageOptions({
            project_id: `eq.${filterVM.project_id()}`
        }));

        lProject.load().then((data) => {
            subscriptions.firstPage(contextSubVM.parameters()).then(() => {
                loader(false);
            }).catch(handleError);
            project(data);
        });

        return {
            filterVM,
            subscriptions,
            lProject,
            project
        };
    },
    view(ctrl) {
        const subsCollection = ctrl.subscriptions.collection();
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
                                            ctrl.subscriptions.total()
                                        ),
                                        ' assinantes',
                                        m.trust('&nbsp;')
                                    ])
                                ),
                                m('.w-col.w-col-5',
                                    m("a.alt-link.fontsize-small.u-right[data-ix='show-dropdown'][href='#']", [
                                        m('span.fa.fa-download',
                                            ''
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
                                _.map(subsCollection, subscription =>
                                    m(dashboardSubscriptionCard, { subscription }))
                            ])
                        ])
                    ]),
                    m('.bg-gray.section',
                        m('.w-container',
                            m('.u-marginbottom-60.w-row', [
                                m(loadMoreBtn, {
                                    collection: ctrl.subscriptions,
                                    cssClass: '.w-col-push-4'
                                })
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
