import m from 'mithril';
import h from '../h';
import paymentVM from '../vms/payment-vm';
import inlineError from './inline-error';

const paymentSlip = {
	controller(args) {
		const slipPaymentDate = paymentVM().getSlipPaymentDate(args.contribution_id),
            loading = m.prop(false),
            error = m.prop(false);

		const buildSlip = () => {
            loading(true);
            m.redraw();
            const req = m.request({
                method: 'post',
                url: `/payment/pagarme/${args.contribution_id}/pay_slip.json`,
                dataType: 'json'
            }).then(data => {
                if(data.payment_status == 'failed'){
                    error(true);
                } else if(data.boleto_url) {
                    window.location.href = `https://www.catarse.me/pt/projects/${args.project_id}/contributions/${args.contribution_id}`;
                }
                loading(false);
                m.redraw();
            }).catch(err => {
                error(true);
                loading(false);
                m.redraw();
            });
			return false;
		};

		return {
			buildSlip: buildSlip,
			slipPaymentDate: slipPaymentDate,
            loading: loading,
            error: error
		};
	},
	view(ctrl, args) {
		return m('.w-row',
            m('.w-col.w-col-12',
                m('.u-margintop-30.u-marginbottom-60.u-radius.card-big.card', [
                    m('.fontsize-small.u-marginbottom-20',
                        `Esse boleto bancário vence no dia ${ctrl.slipPaymentDate() ? h.momentify(ctrl.slipPaymentDate().slip_expiration_date) : 'carregando...'}.`
                    ),
                    m('.fontsize-small.u-marginbottom-40',
                        'Ao gerar o boleto, o realizador já está contando com o seu apoio. Pague até a data de vencimento pela internet, casas lotéricas, caixas eletrônicos ou agência bancária.'
                    ),
                    m('.w-row',
                        m('.w-col.w-col-8.w-col-push-2', [
                            ctrl.loading() ? h.loader() : m('input.btn.btn-large.u-marginbottom-20',{
                            	onclick: ctrl.buildSlip,
                                value: 'Imprimir Boleto',
                                type: 'submit'
                            }),
                            ctrl.error() ? m.component(inlineError, {message: 'Ocorreu um erro ao tentar gerar o boleto. Por favor, tente novamente em alguns instantes.'}) : '',
                            m('.fontsize-smallest.u-text-center.u-marginbottom-30', [
                                'Ao apoiar, você concorda com os ',
                                m('a.alt-link[href=\'/pt/terms-of-use\']',
                                    'Termos de Uso '
                                ),
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
