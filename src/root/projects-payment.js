import m from 'mithril';
import h from '../h';
import paymentVM from '../vms/payment-vm';

const projectsPayment = {
    controller(args) {
        const vm = paymentVM(),
            error = m.prop(false),
            reward = h.getReward(),
            value = m.route.param('value');

        if (!h.getUser()) {
            return h.navigateToDevise();
        }

        return {
            reward: reward,
            value: value,
            vm: vm
        };
    },
    view(ctrl, args) {
        return m('.w-section.w-clearfix.section',
        	[
        		m('.w-col',
        			m('.w-clearfix.w-hidden-main.w-hidden-medium.card.u-radius.u-marginbottom-20',
        				[
        					m('.fontsize-smaller.fontweight-semibold',
        						'Valor do apoio'
        					),
        					m('a.w-inline-block.arrow-admin.fa.fa-chevron-down.fontcolor-secondary[data-ix=\'show-reward-details\'][data-vivaldi-spatnav-clickable=\'1\'][href=\'#\']'),
        					m('.w-clearfix.u-marginbottom-20',
        						m('.fontsize-larger.text-success.u-left',
        							`R$${ctrl.value}`
        						)
        					),
        					m('.w-clearfix.back-payment-info-reward[data-ix=\'display-none-on-load\']', {style: {'display': 'none'}},
        						[
        							m('.fontsize-smaller.fontweight-semibold.u-marginbottom-10',
        								'Recompensa selecionada'
        							),
        							m('.fontsize-smallest', `${ctrl.reward().description}`),
        							m('a.fontsize-small.link-hidden.u-right.fontweight-semibold[href=\'#\']',
        								'Editar'
        							)
        						]
        					)
        				]
        			)
        		),
        		m('.w-container',
        			m('.w-row',
        				[
        					m('.w-col.w-col-8',
        						[
        							ctrl.vm.error() ? m('.w-hidden-main.w-hidden-medium.w-hidden-small.w-hidden-tiny.card.card-error.u-radius.zindex-10.u-marginbottom-30.fontsize-smaller[data-ix=\'display-none-on-load\']', {style: {'display': 'block'}},
        								[
        									m('.u-marginbottom-10.fontweight-bold',
        										'Por favor, reveja os campos abaixo antes de prosseguir'
        									),
        									m('div',
        										'This is some text inside of a div block.'
        									),
        									m('div',
        										'This is some text inside of a div block.'
        									)
        								]
        							) : '',
        							m('.w-form',
        								[
        									m('form.u-marginbottom-40[data-name=\'Email Form\'][id=\'email-form\'][name=\'email-form\']',
        										[
        											m('.u-marginbottom-40.u-text-center-small-only',
        												[
        													m('.fontweight-semibold.lineheight-tight.fontsize-large',
        														'Dados de contato e endereço'
        													),
        													m('.fontsize-smaller',
        														'* Preenchimento obrigatório'
        													)
        												]
        											),
        											m('.w-row',
        												[
        													m('.w-col.w-col-7.w-sub-col',
        														[
        															m('label.field-label.fontweight-semibold[for=\'complete-name\']',
        																'Nome completo *'
        															),
        															m('input.w-input.text-field[id=\'complete-name\'][name=\'complete-name\']', {
                                                                        type: 'text',
                                                                        onchange: m.withAttr('value', ctrl.vm.completeName),
                                                                        value: ctrl.vm.completeName(),
                                                                        required: 'required',
                                                                        placeholder: 'Nome Completo'
                                                                    })
        														]
        													),
        													m('.w-col.w-col-5',
        														[
        															m('label.field-label.fontweight-semibold[for=\'email\']',
        																'Email *'
        															),
        															m('input.w-input.text-field[id=\'email\']', {
                                                                        type: 'email',
                                                                        onchange: m.withAttr('value', ctrl.vm.email),
                                                                        value: ctrl.vm.email(),
                                                                        required: 'required',
                                                                        placeholder: 'email@catarse.me'
                                                                    })
        														]
        													)
        												]
        											),
        											m('.w-checkbox.w-clearfix',
        												[
        													m('input.w-checkbox-input[id=\'anonymous\'][name=\'anonymous\'][type=\'checkbox\']', {
                                                                onchange: m.withAttr('value', ctrl.vm.anonymous),
                                                                checked: ctrl.vm.anonymous(),
                                                            }),
        													m('label.w-form-label.fontsize-smallest[for=\'anonymous\']',
        														'Quero que meu apoio não fique público'
        													)
        												]
        											),
        											ctrl.vm.anonymous() ? m('.card.card-message.u-radius.zindex-10.fontsize-smallest',
        												m('div',
        													[
        														m('span.fontweight-bold',
        															[
        																'Você tem certeza que quer que seu apoio seja anônimo?',
        																m.trust('&nbsp;'),
        																m('br')
        															]
        														),
        														m('br'),
        														'O valor do seu apoio não será divulgado para ninguém além do dono do projeto. Somente o proponente terá acesso a essa informação, independente se o seu investimento seja público ou anônimo.'
        													]
        												)
        											) : ''
        										]
        									)
        								]
        							),
        							m('.u-marginbottom-40',
        								m('.w-form',
        									[
												m('.w-row',
													[
														m('.w-col.w-col-6.w-sub-col',
															[
																m('label.field-label.fontweight-semibold[for=\'country\']',
																	'País *'
																),
																m('select.w-select.text-field[id=\'country\']',
                                                                    _.map(ctrl.vm.countries(), (country) => m('option', {value: country.id}, country.name))
																)
															]
														),
														m('.w-col.w-col-6',
															[
																m('label.field-label.fontweight-semibold[for=\'zip-code\']',
																	'CEP'
																),
																m('input.w-input.text-field[id=\'zip-code\']', {
                                                                    type: 'tel',
                                                                    onchange: m.withAttr('value', ctrl.vm.zipCode),
                                                                    value: ctrl.vm.zipCode(),
                                                                    placeholder: '42100000'
                                                                })
															]
														)
													]
												),
												m('.w-row',
													[
														m('.w-col.w-col-6.w-sub-col',
															[
																m('label.field-label.fontweight-semibold[for=\'street\']',
																	'Rua *'
																),
																m('input.w-input.text-field[id=\'street\']', {
                                                                    type: 'email',
                                                                    onchange: m.withAttr('value', ctrl.vm.street),
                                                                    value: ctrl.vm.street(),
                                                                    required: 'required',
                                                                    placeholder: 'Rua Da Minha Casa'
                                                                })
															]
														),
														m('.w-col.w-col-6',
															m('.w-row',
																[
																	m('.w-col.w-col-6.w-col-small-6.w-col-tiny-6.w-sub-col-middle',
																		[
																			m('label.field-label.fontweight-semibold[for=\'number\']',
																				'Número *'
																			),
																			m('input.w-input.text-field[id=\'number\']', {
                                                                                type: 'text',
                                                                                onchange: m.withAttr('value', ctrl.vm.number),
                                                                                value: ctrl.vm.number(),
                                                                                required: 'required',
                                                                                placeholder: '421'
                                                                            })
																		]
																	),
																	m('.w-col.w-col-6.w-col-small-6.w-col-tiny-6',
																		[
																			m('label.field-label.fontweight-semibold[for=\'address-complement\']',
																				'Complemento'
																			),
																			m('input.w-input.text-field[id=\'address-complement\']', {
                                                                                type: 'text',
                                                                                onchange: m.withAttr('value', ctrl.vm.addressComplement),
                                                                                value: ctrl.vm.addressComplement(),
                                                                                placeholder: 'Residencial X'
                                                                            })
																		]
																	)
																]
															)
														)
													]
												),
												m('.w-row',
													[
														m('.w-col.w-col-4.w-sub-col',
															[
																m('label.field-label.fontweight-semibold[for=\'neighbourhood\']',
																	'Bairro *'
																),
																m('input.w-input.text-field[id=\'neighbourhood\']', {
                                                                    type: 'text',
                                                                    onchange: m.withAttr('value', ctrl.vm.neighbourhood),
                                                                    value: ctrl.vm.neighbourhood(),
                                                                    required: 'required',
                                                                    placeholder: 'São José'
                                                                })
															]
														),
														m('.w-col.w-col-4.w-sub-col',
															[
																m('label.field-label.fontweight-semibold[for=\'city\']',
																	'Cidade *'
																),
																m('input.w-input.text-field[id=\'city\']', {
                                                                    type: 'text',
                                                                    onchange: m.withAttr('value', ctrl.vm.city),
                                                                    value: ctrl.vm.city(),
                                                                    required: 'required',
                                                                    placeholder: 'Cidade'
                                                                })
															]
														),
														m('.w-col.w-col-4',
															[
																m('label.field-label.fontweight-semibold[for=\'state\']',
																	'Estado *'
																),
																m('select.w-select.text-field[id=\'state\']',
                                                                    _.map(ctrl.vm.states(), (state) => m('option', {value: state.id}, state.name))
																)
															]
														)
													]
												),
												m('.w-row',
													[
														m('.w-col.w-col-6.w-sub-col',
															[
																m('label.field-label.fontweight-semibold[for=\'document\']',
																	'CPF *'
																),
																m('input.w-input.text-field[id=\'document\']', {
                                                                    type: 'tel',
                                                                    onchange: m.withAttr('value', ctrl.vm.ownerDocument),
                                                                    value: ctrl.vm.ownerDocument(),
                                                                    required: 'required'
                                                                })
															]
														),
														m('.w-col.w-col-6',
															[
																m('label.field-label.fontweight-semibold[for=\'phone\']',
																	'Telefone *'
																),
																m('input.w-input.text-field[id=\'phone\']', {
                                                                    type: 'tel',
                                                                    onchange: m.withAttr('value', ctrl.vm.phone),
                                                                    value: ctrl.vm.phone(),
                                                                    required: 'required'
                                                                })
															]
														)
													]
												)
        									]
        								)
        							),
        							m('[id=\'step2\']',
        								[
        									m('.u-text-center-small-only.u-marginbottom-30',
        										[
        											m('.fontsize-large.fontweight-semibold',
        												'Escolha o meio de pagamento'
        											),
        											m('.fontsize-smallest.fontcolor-secondary.fontweight-semibold',
        												[
        													m('span.fa.fa-lock',
        														'.'
        													),
        													' PAGAMENTO SEGURO'
        												]
        											)
        										]
        									),
        									m('.flex-row.u-marginbottom-40',
        										[
        											m('a.w-inline-block.btn-select.flex-column.u-text-center.selected[href=\'#\']',
        												[
        													m('.fontsize-base.fontweight-semibold.u-marginbottom-20',
        														'Cartão de crédito'
        													),
        													m('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/57299bd8f326a24d4828a0fd_credit-cards.png\']')
        												]
        											),
        											m('a.w-inline-block.btn-select.flex-column.u-text-center[href=\'#\']',
        												[
        													m('.fontsize-base.fontweight-semibold.u-marginbottom-20',
        														'Boleto bancário'
        													),
        													m('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/57299c6ef96a6e44489a7a07_boleto.png\'][width=\'48\']')
        												]
        											)
        										]
        									),
        									m('.w-form.u-marginbottom-40',
        										[
        											m('form[data-name=\'Email Form\'][id=\'email-form\'][name=\'email-form\']',
        												[
        													m('div',
        														[
        															m('label.field-label.fontweight-semibold[for=\'email-61\']',
        																'Nome no cartão de crédito *'
        															),
        															m('.fontsize-smallest.fontcolor-terciary.u-marginbottom-10.field-label-tip',
        																'Nome impresso na frente do seu cartão de crédito'
        															),
        															m('input.w-input.text-field[data-name=\'Email 61\'][id=\'email-61\'][name=\'email-61\'][required=\'required\'][type=\'email\']')
        														]
        													),
        													m('div',
        														[
        															m('label.field-label.fontweight-semibold[for=\'email-66\']',
        																'Número do cartão de crédito *'
        															),
        															m('.fontsize-smallest.fontcolor-terciary.u-marginbottom-10.field-label-tip',
        																'O número normalmente com 16 dígitos na frente do seu cartão de crédito'
        															),
        															m('input.w-input.text-field[data-name=\'Email 66\'][id=\'email-66\'][name=\'email-66\'][required=\'required\'][type=\'email\']')
        														]
        													),
        													m('div',
        														[
        															m('label.field-label.fontweight-semibold[for=\'email-70\']',
        																'Expiração (mm/aaaa) *'
        															),
        															m('.fontsize-smallest.fontcolor-terciary.u-marginbottom-10.field-label-tip',
        																'A data de validade, geralmente na frente do cartão'
        															),
        															m('.w-row',
        																[
        																	m('.w-col.w-col-6.w-col-tiny-6.w-sub-col',
        																		m('select.w-select.text-field[id=\'field-2\'][name=\'field-2\']',
        																			[
        																				m('option[value=\'\']',
        																					'01 - Janeiro'
        																				),
        																				m('option[value=\'First\']',
        																					'02 - Fevereiro'
        																				),
        																				m('option[value=\'Second\']',
        																					'03 - Março'
        																				),
        																				m('option[value=\'Third\']',
        																					'04 - Abril'
        																				),
        																				m('option[value=\'\']',
        																					'05 - Maio'
        																				),
        																				m('option[value=\'\']',
        																					'06 - Junho'
        																				)
        																			]
        																		)
        																	),
        																	m('.w-col.w-col-6.w-col-tiny-6',
        																		m('select.w-select.text-field[id=\'field-2\'][name=\'field-2\']',
        																			[
        																				m('option[value=\'\']',
        																					'2016'
        																				),
        																				m('option[value=\'First\']',
        																					'2017'
        																				),
        																				m('option[value=\'Second\']',
        																					'2018'
        																				),
        																				m('option[value=\'Third\']',
        																					'2019'
        																				)
        																			]
        																		)
        																	)
        																]
        															)
        														]
        													),
        													m('div',
        														[
        															m('label.field-label.fontweight-semibold[for=\'email-67\']',
        																'Código de Segurança (CVV / CVV2) *'
        															),
        															m('.fontsize-smallest.fontcolor-terciary.u-marginbottom-10.field-label-tip',
        																'Os 3 dígitos (quando na frente) ou 4 dígitos (quando atrás) do seu cartão'
        															),
        															m('.w-row',
        																[
        																	m('.w-col.w-col-8.w-col-tiny-6',
        																		m('input.w-input.text-field[data-name=\'Email 67\'][id=\'email-67\'][name=\'email-67\'][required=\'required\'][type=\'email\']')
        																	),
        																	m('.w-col.w-col-4.w-col-tiny-6.u-text-center',
        																		m('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/57298c1c7e99926e77127bdd_cvv-card.jpg\'][width=\'176\']')
        																	)
        																]
        															)
        														]
        													),
        													m('.w-row',
        														[
        															m('.w-col.w-col-6',
        																[
        																	m('label.field-label.fontweight-semibold[for=\'field\']',
        																		'Parcelas'
        																	),
        																	m('select.w-select.text-field[id=\'field\'][name=\'field\']',
        																		[
        																			m('option[value=\'\']',
        																				'1 X R$75'
        																			),
        																			m('option[value=\'First\']',
        																				'First Choice'
        																			),
        																			m('option[value=\'Second\']',
        																				'Second Choice'
        																			),
        																			m('option[value=\'Third\']',
        																				'Third Choice'
        																			)
        																		]
        																	)
        																]
        															),
        															m('.w-col.w-col-6')
        														]
        													)
        												]
        											),
        											m('.w-form-done',
        												m('p',
        													'Thank you! Your submission has been received!'
        												)
        											),
        											m('.w-form-fail',
        												m('p',
        													'Oops! Something went wrong while submitting the form :('
        												)
        											)
        										]
        									),
        									m('.w-row',
        										[
        											m('.w-col.w-col-2'),
        											m('.w-col.w-col-8',
        												[
        													m('a.btn.btn-large.u-marginbottom-20[href=\'#\']',
        														'Finalizar pagamento'
        													),
        													m('.fontsize-smallest.u-text-center',
        														[
        															'Ao apoiar, você concorda com os ',
        															m('a.alt-link[href=\'#\']',
        																'Termos de Uso'
        															),
        															m.trust('&nbsp;'),
        															'e ',
        															m('a.alt-link[href=\'#\']',
        																'Política de Privacidade'
        															)
        														]
        													)
        												]
        											),
        											m('.w-col.w-col-2')
        										]
        									)
        								]
        							)
        						]
        					),
        					m('.w-col.w-col-4',
        						[
        							m('.w-hidden-small.w-hidden-tiny.card.u-radius.u-marginbottom-20',
        								[
        									m('.fontsize-smaller.fontweight-semibold.u-marginbottom-20',
        										'Valor do apoio'
        									),
        									m('.w-clearfix.u-marginbottom-20',
        										[
        											m('.fontsize-larger.text-success.u-left',
        												`R$${ctrl.value}`
        											),
        											m('a.fontsize-small.link-hidden.u-right.fontweight-semibold[href=\'#\']',
        												'Editar'
        											)
        										]
        									),
        									m('.back-payment-info-reward',
        										[
        											m('.fontsize-smaller.fontweight-semibold.u-marginbottom-10',
        												'Recompensa selecionada'
        											),
        											m('.fontsize-smallest', ctrl.reward().description)

        										]
        									)
        								]
        							),
        							m('.w-hidden-small.w-hidden-tiny.card.u-radius[data-ix=\'new-interaction\']',
        								[
        									m('.fontsize-small.fontweight-semibold.u-marginbottom-20',
        										'Quero apoiar, e agora?'
        									),
        									m('ul.w-list-unstyled',
        										[
        											m('li.fontsize-smaller.alt-link.list-question',
        												m('span',
        													[
        														m('span.faq-box-arrow'),
        														' Como eu apoio este projeto?'
        													]
        												)
        											),
        											m('li.u-marginbottom-10.fontsize-smaller.fontweight-semibold',
        												m('div',
        													[
        														m('span.faq-box-arrow', {style: {'font-weight': '800'}}),
        														m('span.fa.fa-angle-down'),
        														' Quando o pagamento é efetivado?'
        													]
        												)
        											),
        											m('li',
        												m('p.list-answer.fontsize-smaller',
        													'Assim que o MoIP ou o Paypal confirmar a transação. Se você pagou com cartão, a confirmação deverá ser no mesmo dia. Se foi com boleto, em até 4 dias úteis.'
        												)
        											),
        											m('li.alt-link.fontsize-smaller.list-question',
        												m('span',
        													[
        														m('span.faq-box-arrow', {style: {'font-weight': '800'}}),
        														' E se o projeto não atingir a meta?'
        													]
        												)
        											),
        											m('li.fontsize-smaller.alt-link.list-question',
        												m('span',
        													[
        														m('span.faq-box-arrow'),
        														' E se eu eu não quiser usar os créditos do Catarse?'
        													]
        												)
        											),
        											m('li.alt-link.fontsize-smaller.list-question',
        												m('span',
        													[
        														m('span.faq-box-arrow'),
        														'Se o projeto for financiado, como receberei minha recompensa?'
        													]
        												)
        											)
        										]
        									)
        								]
        							)
        						]
        					)
        				]
        			)
        		)
        	]
        );
    }
};

export default projectsPayment;
