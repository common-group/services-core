import m from 'mithril';
import prop from 'mithril/stream';
import _ from 'underscore';
import {
    catarse,
    commonPayment
} from '../api';
import models from '../models';
import h from '../h';
import loadMoreBtn from '../c/load-more-btn';
import filterText from '../c/filter-text';
import FilterDropdown from '../c/filter-dropdown';
import filterDropdownNumberRange from '../c/filter-dropdown-number-range';
import projectDashboardMenu from '../c/project-dashboard-menu';
import dashboardSubscriptionCard from '../c/dashboard-subscription-card';
import projectsSubscriptionReportVM from '../vms/projects-subscription-report-vm';
import projectsContributionReportVM from '../vms/projects-contribution-report-vm';

const statusCustomFilter = {
    view: () => m('.fontsize-smaller.u-text-center', [
        'Status ',
        m('a.fontsize-smallest.tooltip-wrapper.fa.fa-question-circle.fontcolor-secondary', {
            href: 'https://suporte.catarse.me/hc/pt-br/articles/115005632746-Catarse-Assinaturas-FAQ-Realizadores#status',
            target: '_blank'
        })
    ])
};

const dropdownFilterCustomLabel = {
    view: function(ctrl, args) 
    {
        return m('.fontsize-smaller.u-text-center', args.label);
    }
};

const projectSubscriptionReport = {
    oninit: function (vnode) {
        const filterVM = projectsSubscriptionReportVM,
            catarseVM = projectsContributionReportVM,
            dropdownNumber = prop(0),
            error = prop(false),
            loader = prop(true),
            isProjectDataLoaded = prop(false),
            isRewardsDataLoaded = prop(false),
            rewards = prop([]),
            subscriptions = commonPayment.paginationVM(models.userSubscription, 'last_payment_data_created_at.desc', {
                Prefer: 'count=exact'
            }),
            submit = () => {
                // Set order by last paid on filters too
                filterVM.order({ last_payment_data_created_at: 'desc' });
                if (filterVM.reward_external_id() === 'null') {
                    subscriptions.firstPage(filterVM.withNullParameters()).then(null);
                } else {
                    subscriptions.firstPage(filterVM.parameters()).then(null);
                }

                return false;
            },
            filterBuilder = [{
                component: filterText,
                label: 'text_filter',
                data: {
                    label: 'Nome ou email',
                    vm: filterVM.search_index,
                    onchange: submit,
                    wrapper_class: '.u-marginbottom-20.w-col.w-col-3',
                    placeholder: 'Busque por assinantes',
                    onclick: submit
                }
            },
            {
                label: 'status_filter',
                component: FilterDropdown,
                data: {
                    custom_label: [
                        statusCustomFilter,
                        null
                    ],
                    onchange: submit,
                    name: 'status',
                    vm: filterVM.status,
                    wrapper_class: '.w-col.w-col-3',
                    options: [{
                        value: '',
                        option: 'Todos'
                    },
                    {
                        value: 'active',
                        option: 'Ativa'
                    },
                    {
                        value: 'started',
                        option: 'Iniciada'
                    },
                    {
                        value: 'canceling',
                        option: 'Cancelamento solicitado'
                    },
                    {
                        value: 'canceled',
                        option: 'Cancelada'
                    },
                    {
                        value: 'inactive',
                        option: 'Inativa'
                    }
                    ]
                }
            },
            {
                label: 'reward_filter',
                component: FilterDropdown,
                data: {
                    custom_label: [
                        dropdownFilterCustomLabel,
                        {label: 'Recompensa'}
                    ],
                    onchange: submit,
                    name: 'reward_external_id',
                    vm: filterVM.reward_external_id,
                    wrapper_class: '.w-col.w-col-3',
                    options: []
                }
            },
            {
                label: 'payment_filter',
                component: FilterDropdown,
                data: {
                    custom_label: [
                        dropdownFilterCustomLabel,
                        {label: 'Meio de pgto.'}
                    ],
                    onchange: submit,
                    name: 'payment_method',
                    vm: filterVM.payment_method,
                    wrapper_class: '.w-col.w-col-2',
                    options: [{
                        value: '',
                        option: 'Todos'
                    },
                    {
                        value: 'credit_card',
                        option: 'Cartão de crédito'
                    },
                    {
                        value: 'boleto',
                        option: 'Boleto'
                    }
                    ]
                }
            },
            {
                label: 'total_paid_filter',
                component: filterDropdownNumberRange,
                data: {
                    index: 1,
                    selectable: dropdownNumber,
                    label: 'Total apoiado',
                    name: 'total_paid',
                    onapply: submit,
                    vm: filterVM.total_paid,
                    wrapper_class: '.w-col.w-col-2',
                    init_lower_value: '0',
                    init_higher_value: 'mais',
                    value_change_placeholder: 'R$#V1 ou #V2',
                    value_change_both_placeholder: 'R$#V1 a R$#V2',
                    inner_field_placeholder: '0',
                    inner_field_label: 'R$',
                    value_multiplier: 100,
                    min: 0
                }
            },
            {
                label: 'paid_count_filter',
                component: filterDropdownNumberRange,
                data: {
                    index: 2,
                    selectable: dropdownNumber,
                    label: 'Qtde. de apoios',
                    name: 'paid_count',
                    onapply: submit,
                    vm: filterVM.paid_count,
                    wrapper_class: '.w-col.w-col-2',
                    init_lower_value: '0',
                    init_higher_value: 'mais',
                    value_change_placeholder: '#V1 ou #V2',
                    value_change_both_placeholder: '#V1 a #V2',
                    inner_field_placeholder: '0',
                    value_multiplier: 1,
                    min: 0,
                    dropdown_inline_style: {
                        right: '0'
                    }
                }
            }

            ],
            handleError = () => {
                error(true);
                loader(false);
                isProjectDataLoaded(true);
                m.redraw();
            },
            project = prop([{}]);

        catarseVM.project_id(vnode.attrs.project_id);

        const lReward = catarse.loaderWithToken(models.rewardDetail.getPageOptions({
            project_id: `eq.${catarseVM.project_id()}`
        }));

        lReward.load().then((loadedRewards) => {
            rewards(loadedRewards);
            isRewardsDataLoaded(true);
        });
        const mapRewardsToOptions = () => {
            let options = [];
            if (!lReward()) {
                options = _.map(rewards(), r => ({
                    value: r.id,
                    option: `R$ ${h.formatNumber(r.minimum_value, 2, 3)} - ${(r.title ? r.title : r.description).substring(0, 20)}`
                }));
            }

            options.unshift({
                value: null,
                option: 'Sem recompensa'
            });

            options.unshift({
                value: '',
                option: 'Todas'
            });

            return options;
        };

        const lProject = catarse.loaderWithToken(models.projectDetail.getPageOptions({
            project_id: `eq.${catarseVM.project_id()}`
        }));

        lProject.load().then((data) => {
            filterVM.project_id(_.first(data).common_id);
            // override default 'created_at' order on vm
            filterVM.order({ last_payment_data_created_at: 'desc' });
            subscriptions.firstPage(filterVM.parameters()).then(() => {
                loader(false);
                isProjectDataLoaded(true);
            }).catch(handleError);
            project(data);
        });

        return {
            filterVM,
            mapRewardsToOptions,
            filterBuilder,
            submit,
            subscriptions,
            lProject,
            project,
            isProjectDataLoaded,
            isRewardsDataLoaded
        };
    },
    view: function (ctrl, args) {

        const subsCollection = ctrl.subscriptions.collection(),
            filterBuilder = ctrl.filterBuilder,
            statusFilter = _.findWhere(filterBuilder, {
                label: 'status_filter'
            }),
            textFilter = _.findWhere(filterBuilder, {
                label: 'text_filter'
            }),
            rewardFilter = _.findWhere(filterBuilder, {
                label: 'reward_filter'
            }),
            paymentFilter = _.findWhere(filterBuilder, {
                label: 'payment_filter'
            }),
            totalPaidFilter = _.findWhere(filterBuilder, {
                label: 'total_paid_filter'
            }),
            paidCountFilter = _.findWhere(filterBuilder, {
                label: 'paid_count_filter'
            });
        rewardFilter.data.options = ctrl.mapRewardsToOptions();
        if (ctrl.isProjectDataLoaded() && ctrl.isRewardsDataLoaded()) {
            return m('div', [
                m(projectDashboardMenu, {
                    project: prop(_.first(ctrl.project()))
                }),
                m('.dashboard-header', [
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
                    ),
                    m('.u-marginbottom-30.w-container',
                        m('.w-form', [
                            m('form', {
                                onsubmit: ctrl.submit
                            },
                                m('w-row', [
                                    m(textFilter.component, textFilter.data),
                                    m('.w-col.w-col-9',
                                        m('.w-row', [
                                            m(statusFilter.component, statusFilter.data),
                                            m(rewardFilter.component, rewardFilter.data),
                                            m(paymentFilter.component, paymentFilter.data),
                                            m(totalPaidFilter.component, totalPaidFilter.data),
                                            m(paidCountFilter.component, paidCountFilter.data),
                                        ])
                                    )
                                ])
                            )
                        ])
                    )
                ]),
                m('.divider'),
                m('.before-footer.bg-gray.section', [
                    m('.w-container', [
                        m('div',
                            m('.w-row', [
                                m('.u-marginbottom-20.u-text-center-small-only.w-col.w-col-6',
                                    m('.w-inline-block.fontsize-base.u-marginright-10', [
                                        m('span.fontweight-semibold',
                                            ctrl.subscriptions.total()
                                        ),
                                        ' pessoas',
                                        m.trust('&nbsp;')
                                    ])
                                ),
                                m('.w-col.w-col-6',
                                    m(`a.alt-link.fontsize-small.u-right[href='/projects/${args.project_id}/subscriptions_report_download']`, {
                                        oncreate: m.route.link
                                    }, [
                                            m('span.fa.fa-download',
                                                m.trust('&nbsp;')
                                            ),
                                            'Baixar relatórios'
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
                                    m('.table-col.w-col.w-col-2',
                                        m('div',
                                            'Recompensa'
                                        )
                                    ),
                                    m('.table-col.w-col.w-col-1.u-text-center',
                                        m('div',
                                            'Apoio mensal'
                                        )
                                    ),
                                    m('.table-col.w-col.w-col-2.u-text-center',
                                        m('div',
                                            'Total apoiado'
                                        )
                                    ),
                                    m('.table-col.w-col.w-col-2.u-text-center',
                                        m('div',
                                            'Último pagamento'
                                        )
                                    ),
                                    m('.table-col.w-col.w-col-2.u-text-center',
                                        m('div',
                                            'Status da Assinatura'
                                        )
                                    )
                                ])
                            ),
                            m('.fontsize-small', [
                                _.map(subsCollection, subscription =>
                                    m(dashboardSubscriptionCard, {
                                        subscription
                                    }))
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
