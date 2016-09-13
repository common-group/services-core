import m from 'mithril';
import tooltip from './tooltip';

const paymentCreditCard = {
	controller (args) {
		const vm = args.vm,
			loadingInstallments = m.prop(true);

		const onSubmit = () => {
			console.log('Sending credit-card info!');
			return false;
		};

		const buildTooltip = (tooltipText) => {
            return m.component(tooltip, {
                el: '.tooltip-wrapper.fa.fa-question-circle.fontcolor-secondary',
                text: tooltipText,
                width: 380
            });
        };
        
        vm.getInstallments(args.contribution_id)
        	.then(() => {
        		loadingInstallments(false);
        		m.redraw();
        	});

		return {
			onSubmit: onSubmit,
			buildTooltip: buildTooltip,
			loadingInstallments: loadingInstallments,
			installments: vm.installments
		};
	},
	view (ctrl, args) {
		return m('.w-form.u-marginbottom-40', [
            m('form[name="email-form"]',{
            	onsubmit: ctrl.onSubmit
            },[
                m('div', [
                    m('label.field-label.fontweight-semibold[for="credit-card-name"]',
                        'Nome no cartão de crédito *'
                    ),
                    m('.fontsize-smallest.fontcolor-terciary.u-marginbottom-10.field-label-tip',
                        'Nome impresso na frente do seu cartão de crédito'
                    ),
                    m('input.w-input.text-field[name="credit-card-name"][required="required"][type="text"]')
                ]),
                m('div', [
                    m('label.field-label.fontweight-semibold[for="credit-card-number"]',
                        'Número do cartão de crédito *'
                    ),
                    m('.fontsize-smallest.fontcolor-terciary.u-marginbottom-10.field-label-tip',
                        'O número normalmente com 16 dígitos na frente do seu cartão de crédito'
                    ),
                    m('input.w-input.text-field[name="credit-card-number"][required="required"][type="phone"]')
                ]),
                m('div', [
                    m('label.field-label.fontweight-semibold[for="expiration-date"]',[
                        'Expiração (mm/aaaa)* ',
                        ctrl.buildTooltip('Copy tooltip de validade')
                    ]),
                    m('.fontsize-smallest.fontcolor-terciary.u-marginbottom-10.field-label-tip',
                        'A data de validade, geralmente na frente do cartão'
                    ),
                    m('.w-row', [
                        m('.w-col.w-col-6.w-col-tiny-6.w-sub-col',
                            m('select.w-select.text-field[name="expiration-date_month"]', [
                                m('option[value="]',
                                    '01 - Janeiro'
                                ),
                                m('option[value="First"]',
                                    '02 - Fevereiro'
                                ),
                                m('option[value="Second"]',
                                    '03 - Março'
                                ),
                                m('option[value="Third"]',
                                    '04 - Abril'
                                ),
                                m('option[value="]',
                                    '05 - Maio'
                                ),
                                m('option[value="]',
                                    '06 - Junho'
                                )
                            ])
                        ),
                        m('.w-col.w-col-6.w-col-tiny-6',
                            m('select.w-select.text-field[name="expiration-date_year"]', [
                                m('option[value="]',
                                    '2016'
                                ),
                                m('option[value="First"]',
                                    '2017'
                                ),
                                m('option[value="Second"]',
                                    '2018'
                                ),
                                m('option[value="Third"]',
                                    '2019'
                                )
                            ])
                        )
                    ])
                ]),
                m('div', [
                    m('label.field-label.fontweight-semibold[for="credit-card-cvv"]',[
                        'Código de Segurança (CVV / CVV2)* ',
                        ctrl.buildTooltip('Copy tooltip código de segurança')
                    ]),
                    m('.fontsize-smallest.fontcolor-terciary.u-marginbottom-10.field-label-tip',
                        'Os 3 dígitos (quando na frente) ou 4 dígitos (quando atrás) do seu cartão'
                    ),
                    m('.w-row', [
                        m('.w-col.w-col-8.w-col-tiny-6',
                            m('input.w-input.text-field[name="credit-card-cvv"][required="required"][type="phone"]')
                        ),
                        m('.w-col.w-col-4.w-col-tiny-6.u-text-center',
                            m('img[src="https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/57298c1c7e99926e77127bdd_cvv-card.jpg"][width="176"]')
                        )
                    ])
                ]),
                (ctrl.loadingInstallments() || (ctrl.installments().length <= 1)) ? '' : m('.w-row', [
                    m('.w-col.w-col-6', [
                        m('label.field-label.fontweight-semibold[for="split"]',
                            'Parcelas'
                        ),
                     	 m('select.w-select.text-field[name="split"]', _.map(ctrl.installments(), (installment) => {
                     		return m(`option[value="${installment.number}"]`,
                                `${installment.number} X R$ ${installment.amount}`
                            );
                     	}))
                    ]),
                    m('.w-col.w-col-6')
                ]),
                m('.w-row', [
		            m('.w-col.w-col-8.w-col-push-2', [
		                m('input.btn.btn-large.u-marginbottom-20[type="submit"]',{ value: 'Finalizar pagamento' }, ''),
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
		        ])
            ])
        ]);
	}
};

export default paymentCreditCard;