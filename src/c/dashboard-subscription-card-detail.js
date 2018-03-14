import m from 'mithril';
import _ from 'underscore';
import moment from 'moment';
import UserFollowBtn from './user-follow-btn';
import ownerMessageContent from './owner-message-content';
import modalBox from './modal-box';
import h from '../h';

const dashboardSubscriptionCardDetail = {
    controller(args) {
        return {
            displayModal: h.toggleProp(false, true)
        };
    },

    view(ctrl, args) {
        const subscription = args.subscription,
            user = _.extend(args.user, { project_id: subscription.project_external_id }),
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
                                        'Status:'
                                    ),
                                    m.trust('&nbsp;'),
                                    m('span.fa.fa-circle.text-waiting',
                                        '.'
                                    ),
                                    'Iniciada'
                                ]),
                                m('div', [
                                    m('span.fontcolor-secondary',
                                        'Valor da assinatura:'
                                    ),
                                    'R$15'
                                ]),
                                m('div', [
                                    m('span.fontcolor-secondary',
                                        'Recompensa:'
                                    ),
                                    'R$15 - Título da recompensa'
                                ]),
                                m('div', [
                                    m('span.fontcolor-secondary',
                                        'Meio de pagamento:'
                                    ),
                                    m('span.fa.fa-barcode',
                                        '.'
                                    ),
                                    'Boleto Bancário'
                                ]),
                                m('div', [
                                    m('span.fontcolor-secondary',
                                        'Tempo de assinatura:'
                                    ),
                                    '0 meses'
                                ]),
                                m('.fontsize-base.u-margintop-10', [
                                    m('span.fontcolor-secondary',
                                        'Total apoiado:'
                                    ),
                                    m.trust('&nbsp;'),
                                    m('span.fontweight-semibold.text-success',
                                        'R$0'
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
                                (!_.isEmpty(user.email) ? m('a.btn.btn-small.btn-inline.btn-edit.u-marginright-10.w-button', {
                                    onclick: ctrl.displayModal.toggle
                                }, 'Enviar mensagem') : ''),
                                m(UserFollowBtn, { follow_id: user.id, following: user.following_this_user, enabledClass: 'a.btn.btn-small.btn-inline.btn-terciary.w-button', disabledClass: 'a.btn.btn-small.btn-inline.btn-terciary.w-button' })
                            ])
                        ])
                    ])

                ])
            )
        );
    }
};

export default dashboardSubscriptionCardDetail;
