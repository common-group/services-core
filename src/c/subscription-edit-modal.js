import m from 'mithril';
import h from '../h';

const I18nScope = _.partial(h.i18nScope, 'projects.contributions.edit');
const I18nIntScope = _.partial(h.i18nScope, 'projects.contributions.edit_international');

const subscriptionEditModal = {
    controller(args) {
        const isLongDescription = reward => reward.description && reward.description.length > 110;
        const scope = attr => args.args.vm.isInternational()
                   ? I18nIntScope(attr)
                   : I18nScope(attr);

        return {
            isLongDescription,
            toggleDescription: h.toggleProp(false, true),
            scope
        };
    },
    view(ctrl, args) {
        const reward = args.args.reward;

        return m('.modal-backdrop',
            m('.modal-dialog-outer', 
                m('.modal-dialog-inner.modal-dialog-small',
                    [
                        m('button.modal-close.fa.fa-close.fa-lg.w-inline-block', {onclick: () => args.showModal(false)}),
                        m('.modal-dialog-header', 
                            m('.fontsize-large.u-text-center', 
                                'Confirme suas alterações'
                            )
                        ),
                        m('.modal-dialog-content',
                            [
                                m('.u-marginbottom-10',
                                    [
                                        m('.fontsize-smaller.fontcolor-secondary', 
                                            'Recompensa'
                                        ),
                                        m('div',
                                            [
                                                m('.fontsize-smallest.fontweight-semibold', 
                                                    {
                                                        class: ctrl.isLongDescription(reward())
                                                            ? ctrl.toggleDescription()
                                                                ? 'extended'
                                                                : ''
                                                            : 'extended'
                                                    },
                                                    reward().title
                                                ),
                                                m('.fontsize-smallest.fontcolor-secondary',
                                                    reward().description
                                                        ? reward().description
                                                        : m.trust(
                                                            I18n.t('selected_reward.review_without_reward_html',
                                                                ctrl.scope(
                                                                    _.extend({
                                                                        value: Number(ctrl.value).toFixed()
                                                                    })
                                                                )
                                                            )
                                                        )
                                                ),
                                                m('a.link-more.link-hidden[href="#"]', {
                                                        onclick: ctrl.toggleDescription.toggle
                                                    }, 
                                                    ['mais', m('span.fa.fa-angle-down')]
                                                )
                                            ]
                                        )
                                    ]
                                ),
                                m('.divider.u-marginbottom-10'),
                                m('.u-marginbottom-10',
                                    [
                                        m('.fontsize-smaller.fontcolor-secondary', 
                                            'Valor da assinatura'
                                        ),
                                        m('.fontsize-large',
                                            [
                                                m('span.fontcolor-terciary', 
                                                    'R$10'
                                                ),
                                                m('span.fa.fa-angle-right.fontcolor-terciary', 
                                                    '.'
                                                ),
                                                'R$15'
                                            ]
                                        )
                                    ]
                                ),
                                m('.divider.u-marginbottom-10'),
                                m('.fontsize-smaller.fontcolor-secondary', 
                                    'Pagamento'
                                ),
                                m('.w-hidden-small.w-hidden-tiny',
                                    [
                                        m('.fontsize-large.u-marginbottom-10',
                                            [
                                                m('span.fontcolor-terciary',
                                                    [
                                                        m('span.fa.fa-credit-card', 
                                                            '.'
                                                        ),
                                                        'Cartão final 1234'
                                                    ]
                                                ),
                                                m.trust('&nbsp;'),
                                                m('span.fa.fa-angle-right.fontcolor-terciary', 
                                                    '.'
                                                ),
                                                m('span.fa.fa-barcode', 
                                                    '.'
                                                ),
                                                m.trust('&nbsp;'),
                                                'Boleto bancário'
                                            ]
                                        ),
                                        m('.fontsize-smaller',
                                            [
                                                m('span.fontweight-semibold',
                                                    [
                                                        m('span.fa.fa-money.text-success', 
                                                            '.'
                                                        ),
                                                        'Cobrança hoje:'
                                                    ]
                                                ),
                                                'Nenhuma'
                                            ]
                                        ),
                                        m('.fontsize-smaller.u-marginbottom-10',
                                            [
                                                m('span.fontweight-semibold',
                                                    [
                                                        m('span.fa.fa-calendar-o.text-success', 
                                                            '.'
                                                        ),
                                                        m.trust('&nbsp;'),
                                                        'Próxima cobrança:'
                                                    ]
                                                ),
                                                m.trust('&nbsp;'),
                                                '01/Setembro no valor de R$15'
                                            ]
                                        )
                                    ]
                                ),
                                m('.modal-dialog-nav-bottom', 
                                    m('.w-row',
                                        [
                                            m('.w-col.w-col-2.w-col-push-2'),
                                            m('.u-text-center.w-col.w-col-4', 
                                                m('button.btn.btn-large.u-marginbottom-20', {
                                                        onclick: () => {
                                                            args.confirm(true);
                                                            args.pay();
                                                        }
                                                    },
                                                    'Confirmar'
                                                )
                                            ),
                                            m('.w-col.w-col-4', 
                                                m('button.btn.btn-large.u-marginbottom-20.btn-terciary.btn-no-border', {onclick: () => args.showModal(false)},
                                                    'Cancelar'
                                                )
                                            )
                                        ]
                                    )
                                )
                            ]
                        )
                    ]
                )
            )
        )
    }
};

export default subscriptionEditModal;
