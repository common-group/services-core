/**
 * window.c.cancelSubscriptionContent component
 * Render cancel subscription form
 *
 */
import m from 'mithril';
import {
    catarse,
    commonPayment
} from '../api';
import _ from 'underscore';
import h from '../h';
import models from '../models';

const cancelSubscriptionContent = {
    controller: function(args) {
        const canceling = m.prop(false);

        const cancelSubscription = () => {
            const l = commonPayment.loaderWithToken(models.cancelSubscription.postOptions({
                id: args.subscription.id
            }));
            l.load().then(() => {
                canceling(true);
                args.subscription.status = 'canceling';
                m.redraw();
            });
        };

        return {
            cancelSubscription,
            canceling
        };
    },
    view: function(ctrl, args) {
        const successMessage = m('.modal-dialog-content', [
                m('.fontsize-megajumbo.u-text-center.u-marginbottom-20',
              '🙁'
             ),
                m('.fontsize-base.u-marginbottom-20', [
                    'Sua assinatura de ',
                    m('span.fontweight-semibold',
                  `R$${args.subscription.amount / 100}`
                 ),
                    ' para o projeto ',
                    m('span.fontweight-semibold',
                  args.subscription.project.project_name
                 ),
                    ` foi cancelada. Como sua próxima data de vencimento é no dia ${h.momentify(args.subscription.next_charge_at, 'DD/MM/YYYY')}, sua assinatura ainda estará ativa até este dia. Mas não se preocupe, que você não terá mais nenhuma cobrança em seu nome daqui pra frente.`,
                    m('br'),
                    m('br'),
                    'Se por algum motivo você quiser um reembolso de seu apoio mensal, entre em contato direto com ',
                    m(`a.alt-link[href='/users/${args.subscription.project.project_user_id}#about']`,
                  args.subscription.project.owner_name
                 ),
                    '.',
                    m('br'),
                    m('br'),
                    'Até logo!'
                ])
            ]),
            contactForm = [
                m('.modal-dialog-content', [
                    m('.modal-dialog-nav-bottom',
                        m('.w-row', [
                            m('.w-col.w-col-2'),
                            m('.u-text-center.w-col.w-col-5',
                                m('a.btn.btn-large.u-marginbottom-20', {
                                    onclick: ctrl.cancelSubscription
                                },
                                    'Cancelar assinatura'
                                )
                            ),
                            m('.w-col.w-col-3',
                                m('a.btn.btn-large.u-marginbottom-20.btn-terciary.btn-no-border', {
                                    onclick: args.displayModal.toggle
                                },
                                    'Voltar'
                                )
                            ),
                            m('.w-col.w-col-2')
                        ])
                    ),
                    m('.fontsize-base', [
                        'Tem certeza que você quer solicitar o cancelamento de sua assinatura de ',
                        m('span.fontweight-semibold',
                            `R$${args.subscription.amount / 100}`
                        ),
                        ' para o projeto ',
                        m('span.fontweight-semibold',
                            args.subscription.project.project_name
                        ),
                        '?'
                    ])
                ])
            ];

        return m('div', [
            m('.modal-dialog-header',
                m('.fontsize-large.u-text-center', 'Cancelar sua assinatura')
            ),
            ctrl.canceling() ? successMessage : contactForm
        ]);
    }
};

export default cancelSubscriptionContent;
