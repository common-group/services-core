import m from 'mithril';
import _ from 'underscore';
import I18n from 'i18n-js';
import h from '../h';
import contributionVM from '../vms/contribution-vm';
import ownerMessageContent from '../c/owner-message-content';
import modalBox from '../c/modal-box';
import userVM from '../vms/user-vm';
import loadMoreBtn from './load-more-btn';
import rewardReceiver from './reward-receiver';

const I18nScope = _.partial(h.i18nScope, 'payment.state');

const userContributedBox = {
    controller() {
        const displayModal = h.toggleProp(false, true),
            currentMessage = m.prop(),
            toggleDelivery = (projectId, contribution) => {
                userVM.toggleDelivery(projectId, contribution).then(() => {
                    const lastStatus = contribution.reward_sent_at ? 'delivered' : 'undelivered';
                    contribution.delivery_status = contribution.delivery_status == 'received' ? lastStatus : 'received'; // so we don't have to reload the page
                });
            };

        return {
            toggleAnonymous: userVM.toggleAnonymous,
            displayModal,
            currentMessage,
            toggleDelivery
        };
    },
    view(ctrl, args) {
        const collection = args.collection,
            pagination = args.pagination,
            title = args.title;

        return (!_.isEmpty(collection) ? m('.section-one-column.u-marginbottom-30',
            (ctrl.displayModal() ? m.component(modalBox, {
                displayModal: ctrl.displayModal,
                content: ctrl.currentMessage()
            }) : ''),
            m('.w-container', [
                m('.fontsize-larger.fontweight-semibold.u-marginbottom-30.u-text-center',
                    title
                ),
                m('.card.card-secondary.w-hidden-small.w-hidden-tiny.w-row', [
                    m('.w-col.w-col-3',
                        m('.fontsize-small.fontweight-semibold',
                            'Projeto'
                        )
                    ),
                    m('.w-col.w-col-3',
                        m('.fontsize-small.fontweight-semibold',
                            'Apoio'
                        )
                    ),
                    m('.w-col.w-col-3',
                        m('.fontsize-small.fontweight-semibold',
                            'Recompensa'
                        )
                    ),
                    m('.w-col.w-col-1'),
                    m('.w-col.w-col-2',
                        m('.fontsize-small.fontweight-semibold',
                            'Questionário'
                        )
                    )
                ]),
                _.map(collection, (contribution) => {
                    const contactModalC = [ownerMessageContent, m.prop({
                        id: contribution.project_user_id,
                        name: contribution.project_owner_name,
                        project_id: contribution.project_id
                    })];
                    return [
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
                                m("a.btn.btn-edit.btn-inline.btn-small.w-button[href='#']", {
                                    onclick: () => {
                                        ctrl.displayModal.toggle();
                                        ctrl.currentMessage(contactModalC);
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
                                    m('div',
                                        [
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
                                        ]
                                    )
                                )
                            ]),
                            m('.u-marginbottom-20.w-col.w-col-3', [
                                (contribution.reward_id ? [m('.fontsize-smallest.fontweight-semibold',
                                    contribution.reward_title
                                ), m('p.fontcolor-secondary.fontsize-smallest', m.trust(h.simpleFormat(contribution.reward_description)))] : ' Não selecionou recompensa'),
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
                            (contribution.survey_id ?
                            m('.u-text-center.w-col.w-col-2',
                                m(`a.btn.w-button[href='/contributions/${contribution.id}/surveys/${contribution.survey_id}']`,
                                    'Responda o questionário!'
                                )
                            ) : '')
                        ])
                    ];
                }),
                m('.w-row.u-marginbottom-40.u-margintop-30', [
                    m(loadMoreBtn, {
                        collection: pagination,
                        cssClass: '.w-col-push-5'
                    })
                ])
            ])) : m('div', ''));
    }
};

export default userContributedBox;
