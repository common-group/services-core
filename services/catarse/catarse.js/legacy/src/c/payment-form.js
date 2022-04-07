import m from 'mithril';
import prop from 'mithril/stream';
import _ from 'underscore';
import h from '../h';
import paymentSlip from './payment-slip';
import paymentCreditCard from './payment-credit-card';
import paymentPix from './payment-pix';

const I18nScope = _.partial(h.i18nScope, 'projects.contributions.edit');
const I18nIntScope = _.partial(h.i18nScope, 'projects.contributions.edit_international');

export default class PaymentForm {
    oninit(vnode) {
        const isSlip = prop(false),
            scope = () => vnode.attrs.vm.isInternational()
                       ? I18nIntScope()
                       : I18nScope();
        const isPix = prop(false);
        const isCreditCard = prop(true);
        vnode.state = {
            isSlip,
            isPix,
            isCreditCard,
            scope,
            vm: vnode.attrs.vm
        };
    }

    view({state, attrs}) {
        return m('#catarse_pagarme_form', [
            m('.u-text-center-small-only.u-marginbottom-30', [
                m('.fontsize-large.fontweight-semibold',
                    window.I18n.t('payment_info', state.scope())
                ),
                m('.fontsize-smallest.fontcolor-secondary.fontweight-semibold', [
                    m('span.fa.fa-lock'),
                    window.I18n.t('safe_payment', state.scope())
                ])
            ]),
            m('.flex-row.u-marginbottom-40', [
                m('a.w-inline-block.btn-select.flex-column.u-marginbottom-20.u-text-center[href=\'javascript:void(0);\']', {
                    onclick: () => {
                        state.isCreditCard(true);
                        state.isSlip(false);
                        state.isPix(false);
                    },
                    class: state.isCreditCard() ? 'selected' : ''
                }, [
                    m('.fontsize-base.fontweight-semibold',
                        window.I18n.t('credit_card_select', state.scope())
                        ),
                    m('.fontcolor-secondary.fontsize-smallest.u-marginbottom-20',
                            window.I18n.t('debit_card_info', state.scope())
                        ),
                    m('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/57299bd8f326a24d4828a0fd_credit-cards.png\']')
                ]),
                !attrs.vm.isInternational() ? m('a.w-inline-block.btn-select.flex-column.u-marginbottom-20.u-text-center[href=\'javascript:void(0);\']', {
                    onclick: () => {
                        state.isSlip(true);
                        state.isCreditCard(false);
                        state.isPix(false);
                    },
                    class: state.isSlip() ? 'selected' : ''
                }, [
                    m('.fontsize-base.fontweight-semibold.u-marginbottom-20',
                            'Boleto bancário'
                        ),
                    m('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/57299c6ef96a6e44489a7a07_boleto.png\'][width=\'48\']')
                ]) : m('.flex-column'),
                !attrs.isSubscription && !attrs.vm.isInternational() ? m('a.w-inline-block.btn-select.flex-column.u-marginbottom-20.u-text-center[href=\'javascript:void(0);\']', {
                    onclick: () => {
                        state.isPix(true);
                        state.isSlip(false);
                        state.isCreditCard(false);
                    },
                    class: state.isPix() ? 'selected' : '',
                }, [
                    m('.fontsize-base.fontweight-semibold.u-marginbottom-20',
                            'Pix'
                        ),
                    m('img[src="/images/legacy/logo_pix.png"][width=\'48\']')
                ]) : ''
            ]),
            state.isCreditCard() ? m('#credit-card-section', [
                m(paymentCreditCard, attrs)
            ]) : '',
            !attrs.vm.isInternational() && state.isSlip() ? m('#boleto-section', [
                m(paymentSlip, attrs)
            ]) : '',
            !attrs.isSubscription && !attrs.vm.isInternational() && state.isPix() ? m('#pix-section', [
                m(paymentPix, attrs)
            ]) : ''
        ]);
    }
}
