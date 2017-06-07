import m from 'mithril';
import _ from 'underscore';
import I18n from 'i18n-js';
import h from '../h';
import contributionVM from '../vms/contribution-vm';
import ownerMessageContent from '../c/owner-message-content';
import modalBox from '../c/modal-box';
import userVM from '../vms/user-vm';
import rewardReceiver from './reward-receiver';

const I18nScope = _.partial(h.i18nScope, 'payment.state');

const userContributedBox = {
    controller(args) {
        const displayModal = h.toggleProp(false, true),
            toggleDelivery = (projectId, contribution) => {
                userVM.toggleDelivery(projectId, contribution).then(() => {
                    const lastStatus = contribution.reward_sent_at ? 'delivered' : 'undelivered';
                    contribution.delivery_status = contribution.delivery_status == 'received' ? lastStatus : 'received'; // so we don't have to reload the page
                });
            };

        return {
            toggleAnonymous: userVM.toggleAnonymous,
            displayModal,
            contribution: args.contribution,
            toggleDelivery
        };
    },
    view(ctrl) {
        const contribution = ctrl.contribution,
            contactModalC = [ownerMessageContent, m.prop({
                id: contribution.project_user_id,
                name: contribution.project_owner_name,
                project_id: contribution.project_id
            })],
            answeredAt = contribution.survey && (_.find(contribution.survey.multiple_choice_questions, question => !_.isEmpty(question.answered_at)).answered_at ||
                _.find(contribution.survey.open_questions, question => !_.isEmpty(question.answered_at)).answered_at),
            finishedAt = contribution.survey && contribution.survey.finished_at;

        return (!_.isEmpty(contribution) ? m('div',
            (ctrl.displayModal() ? m.component(modalBox, {
                displayModal: ctrl.displayModal,
                content: contactModalC
            }) : ''), [
                m('.card.w-row', [
                    m('.u-marginbottom-20.w-col.w-col-3', [
                        m('.u-marginbottom-10.w-row', [
                            m('.u-marginbottom-10.w-col.w-col-4',
                                m(`a.w-inline-block[href='/${contribution.permalink}']`,
                                    m(`img.thumb-project.u-radius[alt='${contribution.project_name}'][src='${contribution.project_image}'][width='50']`)
                                )
                            ),
                            m('.w-col.w-col-8',
                                m('.fontsize-small.fontweight-semibold.lineheight-tight',
                                    m(`a.link-hidden[href='/${contribution.permalink}']`,
                                        contribution.project_name
                                    )
                                )
                            )
                        ]),
                        m("a.btn.btn-edit.btn-inline.btn-small.w-button[href='javascript:void(0);']", {
                            onclick: () => {
                                ctrl.displayModal.toggle();
                            }
                        },
                            'Enviar mensagem'
                        )
                    ]),
                    m('.u-marginbottom-20.w-col.w-col-3', [
                        m('.fontsize-base.fontweight-semibold.lineheight-looser',
                            `R$ ${contribution.value}`
                        ),
                        m('.w-embed',
                            m('div', [
                                m('.w-hidden-main.w-hidden-medium.fontsize-smallest.fontweight-semibold',
                                    'Status'
                                ),
                                m('.fontsize-smaller.fontweight-semibold', [
                                    m('.lineheight-tighter'),
                                    m(`span.fa.fa-circle.fontsize-smallest.${contribution.state === 'paid' ? 'text-success' : contribution.state === 'pending' ? 'text-waiting' : 'text-error'}`,
                                        m.trust('&nbsp;')
                                    ),
                                    I18n.t(contribution.state, I18nScope({
                                        date: h.momentify(contribution[`${contribution.state}_at`])
                                    }))
                                ]),
                                m('.fontsize-smallest',
                                    (contribution.installments > 1 ? (`${contribution.installments} x R$ ${contribution.installment_value} `) : ''),
                                    (contribution.payment_method === 'BoletoBancario' ? 'Boleto Bancário' : 'Cartão de Crédito')
                                ),
                                (contributionVM.canShowReceipt(contribution) ?
                                    m(`a.alt-link.u-margintop-10[href='https://www.catarse.me/pt/projects/${contribution.project_id}/contributions/${contribution.contribution_id}/receipt'][target='__blank']`,
                                        'Ver recibo'
                                    ) : ''),

                                (contributionVM.canShowSlip(contribution) ?
                                    m(`a.alt-link.u-margintop-10[href='${contribution.gateway_data.boleto_url}'][target='__blank']`,
                                        'Imprimir boleto'
                                    ) : ''),

                                (contributionVM.canGenerateSlip(contribution) ?
                                    m(`a.alt-link.u-margintop-10[href='https://www.catarse.me/pt/projects/${contribution.project_id}/contributions/${contribution.contribution_id}/second_slip'][target='__blank']`,
                                        'Gerar 2a via'
                                    ) : ''),
                                m('.w-checkbox.fontsize-smallest.fontcolor-secondary.u-margintop-10', [
                                    m(`input.w-checkbox-input[id='anonymous'][name='anonymous'][type='checkbox']${contribution.anonymous ? '[checked=\'checked\']' : ''}[value='1']`, {
                                        onclick: () => ctrl.toggleAnonymous(contribution.project_id, contribution)
                                    }),
                                    m('label.w-form-label',
                                        'Quero que meu apoio não seja público'
                                    )
                                ])
                            ])
                        )
                    ]),
                    m('.u-marginbottom-20.w-col.w-col-3', [
                        (contribution.reward_id ? [m('.fontsize-smallest.fontweight-semibold',
                            contribution.reward_title
                        ), m('p.fontcolor-secondary.fontsize-smallest', m.trust(h.simpleFormat(
                            `${contribution.reward_description.substring(0, 90)} (...)`
                        )))] : ' Não selecionou recompensa'),
                        contribution.deliver_at ? m('.fontsize-smallest', [
                            m('span.fontweight-semibold',
                                'Estimativa de entrega: '
                            ),
                            h.momentify(contribution.deliver_at, 'MMMM/YYYY')
                        ]) : '',
                        contributionVM.canBeDelivered(contribution) ? m('.fontsize-smallest', [
                            m('span.fontweight-semibold',
                                'Status da entrega:'
                            ),
                            m.trust('&nbsp;'),
                            h.contributionStatusBadge(contribution)
                        ]) : ''
                    ]),
                    m(rewardReceiver, {
                        contribution
                    }),
                    (contribution.survey ? [console.log(contribution.survey),

                        (!answeredAt && finishedAt) ?
                        m('.u-text-center.w-col.w-col-2',
                            m('.fontsize-smaller.fontweight-semibold.lineheight-tighter',
                                m(`a.link-error[href='/contributions/${contribution.id}/surveys/${contribution.survey.survey_id}'][target='_blank']`, [
                                    m("span[xmlns='http://www.w3.org/1999/xhtml']"),
                                    m("span.fa.fa-exclamation-circle[xmlns='http://www.w3.org/1999/xhtml']",
                                        ''
                                    ),
                                    m.trust('&nbsp;'),
                                    'Questionário',
                                    m('br'),
                                    'Não respondido'
                                ])
                            )
                        ) : answeredAt ?
                        m('.u-text-center.w-col.w-col-2', [
                            m('.fontsize-smaller.fontweight-semibold.lineheight-tighter',
                                m(`a.link-hidden-dark[href='/contributions/${contribution.id}/surveys/${contribution.survey.survey_id}'][target='_blank']`, [
                                    'Questionário',
                                    m('br'),
                                    'Respondido'
                                ])
                            ),
                            m('.fontcolor-secondary.fontsize-smallest',
                                `em ${h.momentify(answeredAt, 'DD/MM/YYYY')}`
                            )
                        ]) :
                        m('.u-text-center.w-col.w-col-2',
                            m(`a.btn.w-button[href='/contributions/${contribution.id}/surveys/${contribution.survey.survey_id}']`,
                                'Responda o questionário!'
                            )
                        )
                    ] : '')
                ])
            ]
        ) : m('div', ''));
    }
};

export default userContributedBox;
