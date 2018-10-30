import m from 'mithril';
import prop from 'mithril/stream';
import _ from 'underscore';
import { catarse } from '../api';
import models from '../models';
import h from '../h';
import projectDashboardMenu from '../c/project-dashboard-menu';
import projectContributionReportHeader from '../c/project-contribution-report-header';
import projectContributionReportContent from '../c/project-contribution-report-content';
import projectsContributionReportVM from '../vms/projects-contribution-report-vm';
import FilterMain from '../c/filter-main';
import FilterDropdown from '../c/filter-dropdown';
import downloadReports from '../c/download-reports';
import InfoProjectContributionLegend from '../c/info-project-contribution-legend';
import ProjectContributionStateLegendModal from '../c/project-contribution-state-legend-modal';
import ProjectContributionDeliveryLegendModal from '../c/project-contribution-delivery-legend-modal';

const projectContributionReport = {
    oninit: function(vnode) {
        const listVM = catarse.paginationVM(models.projectContribution, 'id.desc', {
                Prefer: 'count=exact'
            }),
            filterVM = projectsContributionReportVM,
            project = prop([{}]),
            rewards = prop([]),
            showDownloads = prop(false),
            contributionStateOptions = prop([]),
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
                        value: 'refunded',
                        option: 'Reembolsado'
                    }],
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
                    label: 'Recompensa',
                    onchange: submit,
                    name: 'reward_id',
                    vm: filterVM.reward_id,
                    wrapper_class: '.w-sub-col.w-col.w-col-3',
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
                    wrapper_class: '.w-sub-col.w-col.w-col-3',
                    options: [{
                        value: '',
                        option: 'Todos'
                    },
                    {
                        value: 'undelivered',
                        option: 'Não entregue'
                    },
                    {
                        value: 'delivered',
                        option: 'Entregue'
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
                label: 'survey_filter',
                component: FilterDropdown,
                data: {
                    label: 'Status do questionário',
                    onchange: submit,
                    name: 'survey_status',
                    vm: filterVM.survey_status,
                    wrapper_class: '.w-col.w-col-3',
                    options: [{
                        value: '',
                        option: 'Todos'
                    },
                    {
                        value: 'not_sent',
                        option: 'Não enviado'
                    },
                    {
                        value: 'sent,answered',
                        option: 'Enviado'
                    },
                    {
                        value: 'sent',
                        option: 'Não Respondido'
                    },
                    {
                        value: 'answered',
                        option: 'Respondido'
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
                    wrapper_class: '.w-sub-col.w-col.w-col-3',
                    options: contributionStateOptions
                }
            }
            ];

        filterVM.project_id(vnode.attrs.project_id);

        const lReward = catarse.loaderWithToken(models.rewardDetail.getPageOptions({
            project_id: `eq.${filterVM.project_id()}`
        }));
        const lProject = catarse.loaderWithToken(models.projectDetail.getPageOptions({
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

        if (!listVM.collection().length) {
            if (m.route.param('rewardId')) {
                filterVM.reward_id(m.route.param('rewardId'));
            }
            listVM.firstPage(filterVM.parameters());
        }

        return {
            listVM,
            filterVM,
            filterBuilder,
            submit,
            lProject,
            rewards,
            project,
            showDownloads,
            mapRewardsToOptions
        };
    },
    view: function({state}) {
        const list = ctrl.listVM;

        if (!ctrl.lProject()) {
            return m('', [
                m(projectDashboardMenu, {
                    project: prop(_.first(ctrl.project()))
                }),
                ctrl.showDownloads() ? m(downloadReports, {
                    project: prop(_.first(ctrl.project())),
                    rewards: ctrl.rewards()
                }) : [
                    m(`.w-section.section-product.${_.first(ctrl.project()).mode}`),
                    m(projectContributionReportHeader, {
                        submit: ctrl.submit,
                        filterBuilder: ctrl.filterBuilder,
                        form: ctrl.filterVM.formDescriber,
                        mapRewardsToOptions: ctrl.mapRewardsToOptions,
                        filterVM: ctrl.filterVM
                    }),
                    m(projectContributionReportContent, {
                        submit: ctrl.submit,
                        list,
                        showDownloads: ctrl.showDownloads,
                        filterVM: ctrl.filterVM,
                        project: prop(_.first(ctrl.project()))
                    })
                ]
            ]);
        }
        return m('', h.loader());
    }
};

export default projectContributionReport;
