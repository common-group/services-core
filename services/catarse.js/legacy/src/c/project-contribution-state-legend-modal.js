import m from 'mithril';
import _ from 'underscore';
import h from '../h';

const I18nScope = _.partial(h.i18nScope, 'projects.contributions_report.legend_labels');

const ProjectContributionStateLegendModal = {
    controller: function(args) {
        const translate = path => window.I18n.t(path, I18nScope());

        return {
            stages: {
                online: [
                    {
                        label: translate('online.paid.label'),
                        text: translate('online.paid.text'),
                        i_class: '.fa.fa-circle.text-success'
                    }, {
                        label: translate('online.pending.label'),
                        text: translate('online.pending.text'),
                        i_class: '.fa.fa-circle.text-waiting'
                    }, {
                        label: translate('online.refunded.label'),
                        text: translate('online.refunded.text'),
                        i_class: '.fa.fa-circle.text-error'
                    }
                ],
                failed: [
                    {
                        label: translate('failed.refunded.label'),
                        text: translate('failed.refunded.text'),
                        i_class: '.fa.fa-circle.text-refunded'
                    }
                ],
                successful: [
                    {
                        label: translate('successful.paid.label'),
                        text: translate('successful.paid.text'),
                        i_class: '.fa.fa-circle.text-success'
                    },
                    {
                        label: translate('successful.refunded.label'),
                        text: translate('successful.refunded.text'),
                        i_class: '.fa.fa-circle.text-error'
                    },
                ],

            }
        };
    },
    view: function(ctrl, args) {
        const project = _.first(args.project()),
            project_stage = (project.state == 'waiting_funds' ? 'online' : project.state);

        return m('div', [
            m('.modal-dialog-header', [
                m('.fontsize-large.u-text-center',
                  'Status do apoio')
            ]),
            m('.modal-dialog-content', _.map(ctrl.stages[project_stage], (item, i) => m('.u-marginbottom-20', [
                m('.fontsize-small.fontweight-semibold', [
                    m(`span${item.i_class}`),
                    `  ${item.label}`
                ]),
                m('.fontsize-smaller', m.trust(item.text))
            ])))
        ]);
    }
};

export default ProjectContributionStateLegendModal;
