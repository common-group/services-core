import m from 'mithril';
import I18n from 'i18n-js';
import h from '../h';
import inlineError from './inline-error';
import projectVM from '../vms/project-vm';
import commonPaymentVM from '../vms/common-payment-vm';

const I18nScope = _.partial(h.i18nScope, 'projects.contributions.edit.errors');

const paymentSlip = {
    controller(args) {
        const vm = args.vm,
            slipPaymentDate = projectVM.isSubscription() ? null : vm.getSlipPaymentDate(args.contribution_id),
            loading = m.prop(false),
            error = m.prop(false),
            completed = m.prop(false);

        const buildSlip = () => {
            loading(true);
            m.redraw();
            if (projectVM.isSubscription()) {
                const commonData = {
                    rewardCommonId: args.reward_common_id,
                    userCommonId: args.user_common_id,
                    projectCommonId: args.project_common_id,
                    amount: args.value * 100
                };
                commonPaymentVM.sendSlipPayment(vm, commonData);

                return false;
            }
            vm.paySlip(args.contribution_id, args.project_id, error, loading, completed);

            return false;
        };

        return {
            vm,
            buildSlip,
            slipPaymentDate,
            loading,
            completed,
            error
        };
    },
    view(ctrl, args) {
        return m('.w-row',
                    m('.w-col.w-col-12',
                        m('.u-margintop-30.u-marginbottom-60.u-radius.card-big.card', [
                            projectVM.isSubscription() ? '' : m('.fontsize-small.u-marginbottom-20',
                                ctrl.slipPaymentDate() ? `Esse boleto bancário vence no dia ${h.momentify(ctrl.slipPaymentDate().slip_expiration_date)}.` : 'carregando...'
                            ),
                            m('.fontsize-small.u-marginbottom-40',
                                'Ao gerar o boleto, o realizador já está contando com o seu apoio. Pague até a data de vencimento pela internet, casas lotéricas, caixas eletrônicos ou agência bancária.'
                            ),
                            m('.w-row',
                                m('.w-col.w-col-8.w-col-push-2', [
                                    ctrl.vm.isLoading() ? h.loader() : ctrl.completed() ? '' : m('input.btn.btn-large.u-marginbottom-20', {
                                        onclick: ctrl.buildSlip,
                                        value: 'Imprimir Boleto',
                                        type: 'submit'
                                    }),

                                    !_.isEmpty(ctrl.vm.submissionError()) ? m('.card.card-error.u-radius.zindex-10.u-marginbottom-30.fontsize-smaller', m('.u-marginbottom-10.fontweight-bold', m.trust(ctrl.vm.submissionError()))) : '',
                                    ctrl.error() ? m.component(inlineError, { message: ctrl.error() }) : '',
                                    m('.fontsize-smallest.u-text-center.u-marginbottom-30', [
                                        'Ao apoiar, você concorda com os ',
                                        m('a.alt-link[href=\'/pt/terms-of-use\']',
                                    'Termos de Uso '
                                ),
                                (projectVM.isSubscription() ?
                                m('a.alt-link[href=\'https://suporte.catarse.me/hc/pt-br/articles/115005588243\'][target=\'_blank\']', ', Regras do Catarse Assinaturas ')
                                : ''),
                                        'e ',
                                        m('a.alt-link[href=\'/pt/privacy-policy\']',
                                    'Política de Privacidade'
                                )
                                    ])
                                ])
                    )
                        ])
            )
        );
    }
};

export default paymentSlip;
