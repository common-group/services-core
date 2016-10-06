import m from 'mithril';
import h from '../h';
import paymentSlip from './payment-slip';
import paymentCreditCard from './payment-credit-card';

const paymentForm = {
    controller() {
        return {
            toggleBoleto: h.toggleProp(false, true)
        };
    },
    view(ctrl, args) {
        return m('#catarse_pagarme_form', [
            m('.u-text-center-small-only.u-marginbottom-30', [
                m('.fontsize-large.fontweight-semibold',
                    'Escolha o meio de pagamento'
                ),
                m('.fontsize-smallest.fontcolor-secondary.fontweight-semibold', [
                    m('span.fa.fa-lock'),
                    ' PAGAMENTO SEGURO'
                ])
            ]),
            m('.flex-row.u-marginbottom-40', [
                m('a.w-inline-block.btn-select.flex-column.u-text-center[href=\'javascript:void(0);\']', {
                    onclick: ctrl.toggleBoleto.toggle,
                    class: !ctrl.toggleBoleto() ? 'selected' : ''
                }, [
                    m('.fontsize-base.fontweight-semibold',
                        'Cartão de crédito'
                    ),
                    m('.fontcolor-secondary.fontsize-smallest.u-marginbottom-20',
                        '(não aceitamos cartão de débito)'
                    ),
                    m('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/57299bd8f326a24d4828a0fd_credit-cards.png\']')
                ]),
                !args.vm.isInternational() ? m('a.w-inline-block.btn-select.flex-column.u-text-center[href=\'javascript:void(0);\']', {
                    onclick: ctrl.toggleBoleto.toggle,
                    class: ctrl.toggleBoleto() ? 'selected' : ''
                }, [
                    m('.fontsize-base.fontweight-semibold.u-marginbottom-20',
                        'Boleto bancário'
                    ),
                    m('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/57299c6ef96a6e44489a7a07_boleto.png\'][width=\'48\']')
                ]) : m('.flex-column')
            ]), !ctrl.toggleBoleto() ? m('#credit-card-section', [
                m.component(paymentCreditCard, {vm: args.vm, contribution_id: args.contribution_id, project_id: args.project_id, user_id: args.user_id})
            ]) : !args.vm.isInternational() ? m('#boleto-section', [
                m.component(paymentSlip, {contribution_id: args.contribution_id, project_id: args.project_id})
            ]) : ''
        ]);
    }
};

export default paymentForm;
