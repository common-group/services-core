import m from 'mithril';
import _ from 'underscore';
import h from '../h';

const ProjectContributionStateLegendModal = {
    controller(args) {
        return {
            stages: {
                online: [
                    {
                        label: 'Confirmado',
                        text: 'Apoios de cartão de crédito ou de boleto, que foram pagos e confirmados pelo sistema.',
                        i_class: '.fa.fa-circle.text-success'
                    }, {
                        label: 'Iniciado',
                        text: 'Apoios de boleto que ainda não foram pagos ou que ainda não foram contabilizados no sistema.<br/> Obs. Depois de pago, o boleto pode demorar até 2 dias úteis para ser confirmado no sistema.',
                        i_class: '.fa.fa-circle.text-waiting'
                    }, {
                        label: 'Contestado',
                        text: 'Apoios que foram cancelados pelo apoiador após o pagamento.',
                        i_class: '.fa.fa-circle.text-error'
                    }
                ],
                failed: [
                    {
                        label: 'Reembolso em andamento',
                        text: 'Apoiador já forneceu os dados bancários e reembolso está em andamento.',
                        i_class: '.fa.fa-circle-o.text-refunded'
                    },
                    {
                        label: 'Reembolsado',
                        text: 'O valor foi reembolsado para o apoiador.',
                        i_class: '.fa.fa-circle.text-refunded'
                    },
                    {
                        label: 'Reembolso não iniciado',
                        text: 'Apoiador ainda não forneceu dados bancários para o Catarse efetuar o reembolso ou os dados fornecidos estão incorretos.',
                        i_class: '.fa.fa-circle-o.text-error'
                    }
                ],
                successful: [
                    {
                        label: 'Confirmado',
                        text: 'Apoios confirmados no sistema.',
                        i_class: '.fa.fa-circle.text-success'
                    },
                    {
                        label: 'Contestado',
                        text: 'Apoios que foram cancelados pelo apoiador após o pagamento. ',
                        i_class: '.fa.fa-circle.text-error'
                    },
                ],

            }
        };
    },
    view(ctrl, args) {
        const project = _.first(args.project()),
              project_stage = (project.state == 'waiting_funds' ? 'online' : project.state);

        return m('div', [
            m('.modal-dialog-header', [
                m('.fontsize-large.u-text-center',
                  'Status do apoio')
            ]),
            m('.modal-dialog-content', _.map(ctrl.stages[project_stage], (item, i) => {
                console.log(item);
                return m('.u-marginbottom-20', [
                    m('.fontsize-small.fontweight-semibold', [
                        m(`span${item.i_class}`),
                        `  ${item.label}`
                    ]),
                    m('.fontsize-smaller', m.trust(item.text))
                ]);
            }))
        ]);
    }
};

export default ProjectContributionStateLegendModal;
