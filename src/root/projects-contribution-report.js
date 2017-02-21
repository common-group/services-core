import m from 'mithril';
import _ from 'underscore';
import postgrest from 'mithril-postgrest';
import models from '../models';
import h from '../h';
import projectDashboardMenu from '../c/project-dashboard-menu';
import projectContributionReportHeader from '../c/project-contribution-report-header';
import projectContributionReportContent from '../c/project-contribution-report-content';
import projectsContributionReportVM from '../vms/projects-contribution-report-vm';
import FilterMain from '../c/filter-main';
import FilterDropdown from '../c/filter-dropdown';
import InfoProjectContributionLegend from '../c/info-project-contribution-legend';
import ProjectContributionStateLegendModal from '../c/project-contribution-state-legend-modal';
import ProjectContributionDeliveryLegendModal from '../c/project-contribution-delivery-legend-modal';

const projectContributionReport = {
    controller(args) {
        const listVM = postgrest.paginationVM(models.projectContribution, 'id.desc', {
                Prefer: 'count=exact'
            }),
            filterVM = projectsContributionReportVM,
            project = m.prop([{}]),
            rewards = m.prop([]),
            contributionStateOptions = m.prop([]),
            reloadSelectOptions = (projectState) => {
                let opts = [{
                    value: '',
                    option: 'Todos'
                }];

                const optionsMap = {
                    online: [{
                        value: 'paid',
                        option: 'Confirmado'
                    },
                    {
                        value: 'pending',
                        option: 'Iniciado'
                    },
                    {
                        value: 'refunded,chargeback,deleted,pending_refund',
                        option: 'Contestado'
                    },
                    ],
                    waiting_funds: [{
                        value: 'paid',
                        option: 'Confirmado'
                    },
                    {
                        value: 'pending',
                        option: 'Iniciado'
                    },
                    {
                        value: 'refunded,chargeback,deleted,pending_refund',
                        option: 'Contestado'
                    },
                    ],
                    failed: [{
                        value: 'pending_refund',
                        option: 'Reembolso em andamento'
                    },
                    {
                        value: 'refunded',
                        option: 'Reembolsado'
                    },
                    {
                        value: 'paid',
                        option: 'Reembolso não iniciado'
                    },
                    ],
                    successful: [{
                        value: 'paid',
                        option: 'Confirmado'
                    },
                    {
                        value: 'refunded,chargeback,deleted,pending_refund',
                        option: 'Contestado'
                    },
                    ]
                };

                opts = opts.concat(optionsMap[projectState] || []);

                contributionStateOptions(opts);
            },
            submit = () => {
                if (filterVM.reward_id() === 'null') {
                    listVM.firstPage(filterVM.withNullParameters()).then(null);
                } else {
                    listVM.firstPage(filterVM.parameters()).then(null);
                }

                return false;
            },
            filterBuilder = [{
                component: FilterMain,
                data: {
                    inputWrapperClass: '.w-input.text-field',
                    btnClass: '.btn.btn-medium',
                    vm: filterVM.full_text_index,
                    placeholder: 'Busque por nome ou email do apoiador'
                }
            },
            {
                label: 'reward_filter',
                component: FilterDropdown,
                data: {
                    label: 'Recompensa selecionada',
                    onchange: submit,
                    name: 'reward_id',
                    vm: filterVM.reward_id,
                    wrapper_class: '.w-sub-col.w-col.w-col-4',
                    options: []
                }
            },
            {
                label: 'delivery_filter',
                component: FilterDropdown,
                data: {
                    custom_label: [InfoProjectContributionLegend, {
                        content: [ProjectContributionDeliveryLegendModal],
                        text: 'Status da entrega'
                    }],
                    onchange: submit,
                    name: 'delivery_status',
                    vm: filterVM.delivery_status,
                    wrapper_class: '.w-col.w-col-4',
                    options: [{
                        value: '',
                        option: 'Todos'
                    },
                    {
                        value: 'undelivered',
                        option: 'Não enviada'
                    },
                    {
                        value: 'delivered',
                        option: 'Enviada'
                    },
                    {
                        value: 'error',
                        option: 'Erro no envio'
                    },
                    {
                        value: 'received',
                        option: 'Recebida'
                    }
                    ]
                }
            },
            {
                label: 'payment_state',
                component: FilterDropdown,
                data: {
                    custom_label: [InfoProjectContributionLegend, {
                        text: 'Status do apoio',
                        content: [ProjectContributionStateLegendModal, {
                            project
                        }]
                    }],
                    name: 'state',
                    onchange: submit,
                    vm: filterVM.state,
                    wrapper_class: '.w-sub-col.w-col.w-col-4',
                    options: contributionStateOptions
                }
            }
            ];

        filterVM.project_id(args.root.getAttribute('data-id'));

        const lReward = postgrest.loaderWithToken(models.rewardDetail.getPageOptions({
            project_id: `eq.${filterVM.project_id()}`
        }));
        const lProject = postgrest.loaderWithToken(models.projectDetail.getPageOptions({
            project_id: `eq.${filterVM.project_id()}`
        }));

        lReward.load().then(rewards);
        lProject.load().then((data) => {
            project(data);
            reloadSelectOptions(_.first(data).state);
        });

        const mapRewardsToOptions = () => {
            let options = [];
            if (!lReward()) {
                options = _.map(rewards(), r => ({
                    value: r.id,
                    option: `R$ ${h.formatNumber(r.minimum_value, 2, 3)} - ${r.description.substring(0, 20)}`
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

        if (!listVM.collection().length) {
            listVM.firstPage(filterVM.parameters());
        }

        return {
            listVM,
            filterVM,
            filterBuilder,
            submit,
            lReward,
            lProject,
            rewards,
            project,
            mapRewardsToOptions
        };
    },
    view(ctrl) {
        const list = ctrl.listVM;

        if (!ctrl.lProject()) {
            return [
                m.component(projectDashboardMenu, {
                    project: m.prop(_.first(ctrl.project()))
                }),
                m.component(projectContributionReportHeader, {
                    submit: ctrl.submit,
                    filterBuilder: ctrl.filterBuilder,
                    form: ctrl.filterVM.formDescriber,
                    mapRewardsToOptions: ctrl.mapRewardsToOptions,
                    filterVM: ctrl.filterVM
                }),
                m('.divider.u-margintop-30'),
                m.component(projectContributionReportContent, {
                    submit: ctrl.submit,
                    list,
                    filterVM: ctrl.filterVM,
                    project: m.prop(_.first(ctrl.project()))
                })
            ];
        }
        return h.loader();
    }
};

export default projectContributionReport;
