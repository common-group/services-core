import m from 'mithril';
import _ from 'underscore';
import postgrest from 'mithril-postgrest';
import models from '../models';
import h from '../h';
import projectDashboardMenu from '../c/project-dashboard-menu';
import projectContributionReportHeader from '../c/project-contribution-report-header';
import projectContributionReportContent from '../c/project-contribution-report-content';
import projectsContributionReportVM from '../vms/projects-contribution-report-vm';

const projectContributionReport = {
    controller (args) {
        const listVM = postgrest.paginationVM(models.projectContribution, 'id.desc', {'Prefer': 'count=exact'}),
              filterVM = projectsContributionReportVM,
              project = m.prop({}),
              rewards = m.prop([]),
              filterBuilder = [
                  {
                      component: 'FilterMain',
                      data: {
                          inputWrapperClass: '.w-input.text-field',
                          btnClass: '.btn.btn-medium',
                          vm: filterVM.full_text_index,
                          placeholder: 'Busque por nome ou email do apoiador'
                      }
                  }, {
                      label: 'reward_filter',
                      component: 'FilterDropdown',
                      data: {
                          label: 'Recompensa',
                          name: 'reward_id',
                          vm: filterVM.reward_id,
                          wrapper_class: '.w-col.w-col-6.w-col-small-6.w-col-tiny-6._w-sub-col-middle',
                          options: []
                      }
                  }, {
                      label: 'payment_state',
                      component: 'FilterDropdown',
                      data: {
                          label: 'Status do apoio',
                          name: 'state',
                          vm: filterVM.state,
                          wrapper_class: '.w-col.w-col-6.w-col-small-6.w-col-tiny-6._w-sub-col-middle',
                          options: [{
                              value: '',
                              option: 'Todos'
                          }, {
                              value: 'paid',
                              option: 'Pago'
                          }, {
                              value: 'refused',
                              option: 'Cancelado'
                          }, {
                              value: 'pending',
                              option: 'Pendente'
                          }, {
                              value: 'pending_refund',
                              option: 'Reembolso pendente'
                          }, {
                              value: 'refunded',
                              option: 'Reembolsado'
                          }, {
                              value: 'chargeback',
                              option: 'Contestado'
                          }]
                      }
                  }
              ],
              submit = () => {
                  listVM.firstPage(filterVM.parameters()).then(null);
                  return false;
              };

        filterVM.project_id(args.root.getAttribute('data-id'));

        const lReward = postgrest.loaderWithToken(models.rewardDetail.getPageOptions({project_id: `eq.${filterVM.project_id()}`}));
        const lProject = postgrest.loaderWithToken(models.projectDetail.getPageOptions({project_id: `eq.${filterVM.project_id()}`}));

        lReward.load().then(rewards);
        lProject.load().then(project);

        const mapRewardsToOptions = () => {
            let options = [];
            if(!lReward()) {
                options = _.map(rewards(), (r) => {
                    return {
                        value: r.id,
                        option: `R$ ${h.formatNumber(r.minimum_value, 2, 3)} - ${r.description.substring(0, 20)}`
                    };
                });
            }

            options.unshift({
                value: '',
                option: 'Todas'
            });

            return options;
        };

        if(!listVM.collection().length) {
            listVM.firstPage(filterVM.parameters());
        }

        return {
            listVM: listVM,
            filterVM: filterVM,
            filterBuilder: filterBuilder,
            submit: submit,
            lReward: lReward,
            rewards: rewards,
            project: project,
            mapRewardsToOptions: mapRewardsToOptions
        };
    },
    view (ctrl, args) {
        const list = ctrl.listVM;

        return [
            m.component(projectDashboardMenu, {project: m.prop(_.first(ctrl.project()))}),
            m.component(projectContributionReportHeader, {
                submit: ctrl.submit,
                filterBuilder: ctrl.filterBuilder,
                form: ctrl.filterVM.formDescriber,
                mapRewardsToOptions: ctrl.mapRewardsToOptions,
                filterVM: ctrl.filterVM
            }),
            m('.divider.u-margintop-30'),
            m.component(projectContributionReportContent, {
                list: list
            })
        ];
    }
};

export default projectContributionReport;
