import m from 'mithril';
import _ from 'underscore';
import moment from 'moment';
import UserFollowBtn from './user-follow-btn';
import ownerMessageContent from './owner-message-content';
import I18n from 'i18n-js';
import modalBox from './modal-box';
import subscriptionStatusIcon from './subscription-status-icon';
import paymentMethodIcon from './payment-method-icon';
import h from '../h';

const I18nScope = _.partial(h.i18nScope, 'projects.subscription_fields');

const dashboardSubscriptionCardDetail = {
    controller(args) {
        return {
            displayModal: h.toggleProp(false, true)
        };
    },

    view(ctrl, args) {
        const subscription = args.subscription,
            user = _.extend(args.user, {
                project_id: subscription.project_external_id
            }),
            reward = args.reward,
            contactModalC = [ownerMessageContent, m.prop(user)];

        return m('.details-backed-project.card',
            m('.card.card-terciary',
                m('.w-row', [
                    m('.w-col.w-col-12', [
                        m('.u-marginbottom-20.card.u-radius', [
                            m('.fontsize-small.fontweight-semibold.u-marginbottom-10',
                                'Detalhes da assinatura'
                            ),
                            m('.fontsize-smaller', [
                                m('div', [
                                    m('span.fontcolor-secondary',
                                      'Status: '
                                     ),
                                    m(subscriptionStatusIcon, {
                                        subscription
                                    })
                                ]),
                                m('div', [
                                    m('span.fontcolor-secondary',
                                        'Valor da assinatura: '
                                    ),
                                    `R$${subscription.amount / 100}`
                                ]),
                                m('div', [
                                    m('span.fontcolor-secondary',
                                        'Recompensa: '
                                    ), !_.isEmpty(reward) ? `R$${reward.minimum_value} - ${reward.title} - ${reward.description.substring(0, 90)}(...)` : 'Sem recompensa'
                                ]),
                                m('div', [
                                    m('span.fontcolor-secondary',
                                        'Meio de pagamento: '
                                    ),
                                    m(paymentMethodIcon, {subscription})
                                ]),
                                m('div', [
                                    m('span.fontcolor-secondary',
                                        'Tempo de assinatura: '
                                    ),
                                    `${subscription.paid_count} meses`
                                ]),
                                m('.fontsize-base.u-margintop-10', [
                                    m('span.fontcolor-secondary',
                                        'Total apoiado: '
                                    ),
                                    m.trust('&nbsp;'),
                                    m('span.fontweight-semibold.text-success',
                                        `R$${subscription.total_paid/100}`
                                    )
                                ])
                            ])
                        ]),
                        m('.u-marginbottom-20.card.u-radius', [
                            m('.fontsize-small.fontweight-semibold.u-marginbottom-10',
                                'Perfil'
                            ),
                            m('.fontsize-smaller', [
                                m('div',
                                    subscription.user_email
                                ),
                                m('div',
                                    `Conta no Catarse desde ${moment(user.created_at).format('MMMM YYYY')}`
                                ),
                                m('.u-marginbottom-10', [
                                    `Apoiou ${user.total_contributed_projects} projetos `,
                                    m.trust('&nbsp;'),
                                    '| ',
                                    m.trust('&nbsp;'),
                                    `Criou ${user.total_published_projects} projetos`
                                ]),
                                (ctrl.displayModal() ? m.component(modalBox, {
                                    displayModal: ctrl.displayModal,
                                    content: contactModalC
                                }) : ''),
                                (m('a.btn.btn-small.btn-inline.btn-edit.u-marginright-10.w-button', {
                                    onclick: ctrl.displayModal.toggle
                                }, 'Enviar mensagem')),
                                m(UserFollowBtn, {
                                    follow_id: user.id,
                                    following: user.following_this_user,
                                    enabledClass: 'a.btn.btn-small.btn-inline.btn-terciary.w-button',
                                    disabledClass: 'a.btn.btn-small.btn-inline.btn-terciary.w-button'
                                })
                            ])
                        ])
                    ])

                ])
            )
        );
    }
};

export default dashboardSubscriptionCardDetail;
