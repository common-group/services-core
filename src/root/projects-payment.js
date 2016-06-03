import m from 'mithril';
import h from '../h';

const projectsPayment = {
    controller(args) {
        console.log('The selected reward is ', h.getReward());
    },
    view(ctrl, args) {
        return m(".w-section.w-clearfix.section",
        	[
        		m("._w-col",
        			m(".w-clearfix.w-hidden-main.w-hidden-medium.card.u-radius.u-marginbottom-20",
        				[
        					m(".fontsize-smaller.fontweight-semibold",
        						"Valor do apoio"
        					),
        					m("a.w-inline-block.arrow-admin.fa.fa-chevron-down.fontcolor-secondary[data-ix='show-reward-details'][data-vivaldi-spatnav-clickable='1'][href='#']"),
        					m(".w-clearfix.u-marginbottom-20",
        						m(".fontsize-larger.text-success.u-left",
        							"R$15"
        						)
        					),
        					m(".w-clearfix.back-payment-info-reward[data-ix='display-none-on-load']", {style: {"display": "none"}},
        						[
        							m(".fontsize-smaller.fontweight-semibold.u-marginbottom-10",
        								"Recompensa selecionada"
        							),
        							m(".fontsize-smallest",
        								[
        									"Com esse apoio seu nome ficará",
        									m.trust("&nbsp;"),
        									"gravado no vídeo de agradecimento dos vídeos produzidos e dos agradecimentos dos vídeos e também no agradecimento dos vídeos isso isso isso e também no agradecimento dos vídeos"
        								]
        							),
        							m("a.fontsize-small.link-hidden.u-right.fontweight-semibold[href='#']",
        								"Editar"
        							)
        						]
        					)
        				]
        			)
        		),
        		m(".w-container",
        			m(".w-row",
        				[
        					m(".w-col.w-col-8",
        						[
        							m(".w-hidden-main.w-hidden-medium.w-hidden-small.w-hidden-tiny.card.card-error.u-radius.zindex-10.u-marginbottom-30.fontsize-smaller[data-ix='display-none-on-load']", {style: {"display": "none"}},
        								[
        									m(".u-marginbottom-10.fontweight-bold",
        										"Por favor, reveja os campos abaixo antes de prosseguir"
        									),
        									m("div",
        										"This is some text inside of a div block."
        									),
        									m("div",
        										"This is some text inside of a div block."
        									)
        								]
        							),
        							m(".w-form",
        								[
        									m("form.u-marginbottom-40[data-name='Email Form'][id='email-form'][name='email-form']",
        										[
        											m(".u-marginbottom-40.u-text-center-small-only",
        												[
        													m(".fontweight-semibold.lineheight-tight.fontsize-large",
        														"Dados de contato e endereço"
        													),
        													m(".fontsize-smaller",
        														"* Preenchimento obrigatório"
        													)
        												]
        											),
        											m(".w-row",
        												[
        													m(".w-col.w-col-7._w-sub-col",
        														[
        															m("label.field-label.fontweight-semibold[for='email-59']",
        																"Nome completo *"
        															),
        															m("input.w-input.text-field[data-name='Email 59'][id='email-59'][name='email-59'][placeholder='thiago@catarse.me'][required='required'][type='email']")
        														]
        													),
        													m(".w-col.w-col-5",
        														[
        															m("label.field-label.fontweight-semibold[for='email-57']",
        																"Email *"
        															),
        															m("input.w-input.text-field[data-name='Email 57'][id='email-57'][name='email-57'][placeholder='thiago@catarse.me'][required='required'][type='email']")
        														]
        													)
        												]
        											),
        											m(".w-checkbox.w-clearfix",
        												[
        													m("input.w-checkbox-input[data-name='Checkbox 3'][id='checkbox-3'][name='checkbox-3'][type='checkbox']"),
        													m("label.w-form-label.fontsize-smallest[for='checkbox-3']",
        														"Quero que meu apoio não fique público"
        													)
        												]
        											),
        											m(".w-hidden-main.w-hidden-medium.w-hidden-small.w-hidden-tiny.card.card-message.u-radius.zindex-10.fontsize-smallest",
        												m("div",
        													[
        														m("span.fontweight-bold",
        															[
        																"Você tem certeza que quer que seu apoio seja anônimo?",
        																m.trust("&nbsp;"),
        																m("br")
        															]
        														),
        														m("br"),
        														"O valor do seu apoio não será divulgado para ninguém além do dono do projeto. Somente o proponente terá acesso a essa informação, independente se o seu investimento seja público ou anônimo."
        													]
        												)
        											)
        										]
        									),
        									m(".w-form-done",
        										m("p",
        											"Thank you! Your submission has been received!"
        										)
        									),
        									m(".w-form-fail",
        										m("p",
        											"Oops! Something went wrong while submitting the form :("
        										)
        									)
        								]
        							),
        							m(".u-marginbottom-40",
        								m(".w-form",
        									[
        										m("form[data-name='Email Form'][id='email-form'][name='email-form']",
        											[
        												m(".w-row",
        													[
        														m(".w-col.w-col-6._w-sub-col",
        															[
        																m("label.field-label.fontweight-semibold[for='field']",
        																	"País *"
        																),
        																m("select.w-select.text-field[id='field'][name='field']",
        																	[
        																		m("option[value='First']",
        																			"Brasil"
        																		),
        																		m("option[value='Second']",
        																			"Second Choice"
        																		),
        																		m("option[value='Third']",
        																			"Third Choice"
        																		)
        																	]
        																)
        															]
        														),
        														m(".w-col.w-col-6",
        															[
        																m("label.field-label.fontweight-semibold[for='email-18']",
        																	"CEP"
        																),
        																m("input.w-input.text-field[data-name='Email 18'][id='email-18'][name='email-18'][required='required'][type='email']")
        															]
        														)
        													]
        												),
        												m(".w-row",
        													[
        														m(".w-col.w-col-6._w-sub-col",
        															[
        																m("label.field-label.fontweight-semibold[for='email-31']",
        																	"Rua *"
        																),
        																m("input.w-input.text-field[data-name='Email 31'][id='email-31'][name='email-31'][required='required'][type='email']")
        															]
        														),
        														m(".w-col.w-col-6",
        															m(".w-row",
        																[
        																	m(".w-col.w-col-6.w-col-small-6.w-col-tiny-6._w-sub-col-middle",
        																		[
        																			m("label.field-label.fontweight-semibold[for='email-13']",
        																				"Número *"
        																			),
        																			m("input.w-input.text-field[data-name='Email 13'][id='email-13'][name='email-13'][required='required'][type='email']")
        																		]
        																	),
        																	m(".w-col.w-col-6.w-col-small-6.w-col-tiny-6",
        																		[
        																			m("label.field-label.fontweight-semibold[for='email-14']",
        																				"Complemento"
        																			),
        																			m("input.w-input.text-field[data-name='Email 14'][id='email-14'][name='email-14'][required='required'][type='email']")
        																		]
        																	)
        																]
        															)
        														)
        													]
        												),
        												m(".w-row",
        													[
        														m(".w-col.w-col-4._w-sub-col",
        															[
        																m("label.field-label.fontweight-semibold[for='email-15']",
        																	"Bairro *"
        																),
        																m("input.w-input.text-field[data-name='Email 15'][id='email-15'][name='email-15'][required='required'][type='email']")
        															]
        														),
        														m(".w-col.w-col-4._w-sub-col",
        															[
        																m("label.field-label.fontweight-semibold[for='email-16']",
        																	"Cidade *"
        																),
        																m("input.w-input.text-field[data-name='Email 16'][id='email-16'][name='email-16'][required='required'][type='email']")
        															]
        														),
        														m(".w-col.w-col-4",
        															[
        																m("label.field-label.fontweight-semibold[for='field']",
        																	"Estado *"
        																),
        																m("select.w-select.text-field[id='field'][name='field']",
        																	[
        																		m("option[value='First']",
        																			"Brasil"
        																		),
        																		m("option[value='Second']",
        																			"Second Choice"
        																		),
        																		m("option[value='Third']",
        																			"Third Choice"
        																		)
        																	]
        																)
        															]
        														)
        													]
        												),
        												m(".w-row",
        													[
        														m(".w-col.w-col-6._w-sub-col",
        															[
        																m("label.field-label.fontweight-semibold[for='email-15']",
        																	"CPF *"
        																),
        																m("input.w-input.text-field[data-name='Email 15'][id='email-15'][name='email-15'][required='required'][type='email']")
        															]
        														),
        														m(".w-col.w-col-6",
        															[
        																m("label.field-label.fontweight-semibold[for='email-15']",
        																	"Telefone *"
        																),
        																m("input.w-input.text-field[data-name='Email 15'][id='email-15'][name='email-15'][required='required'][type='email']")
        															]
        														)
        													]
        												)
        											]
        										),
        										m(".w-form-done",
        											m("p",
        												"Thank you! Your submission has been received!"
        											)
        										),
        										m(".w-form-fail",
        											m("p",
        												"Oops! Something went wrong while submitting the form :("
        											)
        										)
        									]
        								)
        							),
        							m("[id='step2']",
        								[
        									m(".u-text-center-small-only.u-marginbottom-30",
        										[
        											m(".fontsize-large.fontweight-semibold",
        												"Escolha o meio de pagamento"
        											),
        											m(".fontsize-smallest.fontcolor-secondary.fontweight-semibold",
        												[
        													m("span.fa.fa-lock",
        														"."
        													),
        													" PAGAMENTO SEGURO"
        												]
        											)
        										]
        									),
        									m(".flex-row.u-marginbottom-40",
        										[
        											m("a.w-inline-block.btn-select.flex-column.u-text-center.selected[href='#']",
        												[
        													m(".fontsize-base.fontweight-semibold.u-marginbottom-20",
        														"Cartão de crédito"
        													),
        													m("img[src='https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/57299bd8f326a24d4828a0fd_credit-cards.png']")
        												]
        											),
        											m("a.w-inline-block.btn-select.flex-column.u-text-center[href='#']",
        												[
        													m(".fontsize-base.fontweight-semibold.u-marginbottom-20",
        														"Boleto bancário"
        													),
        													m("img[src='https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/57299c6ef96a6e44489a7a07_boleto.png'][width='48']")
        												]
        											)
        										]
        									),
        									m(".w-form.u-marginbottom-40",
        										[
        											m("form[data-name='Email Form'][id='email-form'][name='email-form']",
        												[
        													m("div",
        														[
        															m("label.field-label.fontweight-semibold[for='email-61']",
        																"Nome no cartão de crédito *"
        															),
        															m(".fontsize-smallest.fontcolor-terciary.u-marginbottom-10.field-label-tip",
        																"Nome impresso na frente do seu cartão de crédito"
        															),
        															m("input.w-input.text-field[data-name='Email 61'][id='email-61'][name='email-61'][required='required'][type='email']")
        														]
        													),
        													m("div",
        														[
        															m("label.field-label.fontweight-semibold[for='email-66']",
        																"Número do cartão de crédito *"
        															),
        															m(".fontsize-smallest.fontcolor-terciary.u-marginbottom-10.field-label-tip",
        																"O número normalmente com 16 dígitos na frente do seu cartão de crédito"
        															),
        															m("input.w-input.text-field[data-name='Email 66'][id='email-66'][name='email-66'][required='required'][type='email']")
        														]
        													),
        													m("div",
        														[
        															m("label.field-label.fontweight-semibold[for='email-70']",
        																"Expiração (mm/aaaa) *"
        															),
        															m(".fontsize-smallest.fontcolor-terciary.u-marginbottom-10.field-label-tip",
        																"A data de validade, geralmente na frente do cartão"
        															),
        															m(".w-row",
        																[
        																	m(".w-col.w-col-6.w-col-tiny-6._w-sub-col",
        																		m("select.w-select.text-field[id='field-2'][name='field-2']",
        																			[
        																				m("option[value='']",
        																					"01 - Janeiro"
        																				),
        																				m("option[value='First']",
        																					"02 - Fevereiro"
        																				),
        																				m("option[value='Second']",
        																					"03 - Março"
        																				),
        																				m("option[value='Third']",
        																					"04 - Abril"
        																				),
        																				m("option[value='']",
        																					"05 - Maio"
        																				),
        																				m("option[value='']",
        																					"06 - Junho"
        																				)
        																			]
        																		)
        																	),
        																	m(".w-col.w-col-6.w-col-tiny-6",
        																		m("select.w-select.text-field[id='field-2'][name='field-2']",
        																			[
        																				m("option[value='']",
        																					"2016"
        																				),
        																				m("option[value='First']",
        																					"2017"
        																				),
        																				m("option[value='Second']",
        																					"2018"
        																				),
        																				m("option[value='Third']",
        																					"2019"
        																				)
        																			]
        																		)
        																	)
        																]
        															)
        														]
        													),
        													m("div",
        														[
        															m("label.field-label.fontweight-semibold[for='email-67']",
        																"Código de Segurança (CVV / CVV2) *"
        															),
        															m(".fontsize-smallest.fontcolor-terciary.u-marginbottom-10.field-label-tip",
        																"Os 3 dígitos (quando na frente) ou 4 dígitos (quando atrás) do seu cartão"
        															),
        															m(".w-row",
        																[
        																	m(".w-col.w-col-8.w-col-tiny-6",
        																		m("input.w-input.text-field[data-name='Email 67'][id='email-67'][name='email-67'][required='required'][type='email']")
        																	),
        																	m(".w-col.w-col-4.w-col-tiny-6.u-text-center",
        																		m("img[src='https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/57298c1c7e99926e77127bdd_cvv-card.jpg'][width='176']")
        																	)
        																]
        															)
        														]
        													),
        													m(".w-row",
        														[
        															m(".w-col.w-col-6",
        																[
        																	m("label.field-label.fontweight-semibold[for='field']",
        																		"Parcelas"
        																	),
        																	m("select.w-select.text-field[id='field'][name='field']",
        																		[
        																			m("option[value='']",
        																				"1 X R$75"
        																			),
        																			m("option[value='First']",
        																				"First Choice"
        																			),
        																			m("option[value='Second']",
        																				"Second Choice"
        																			),
        																			m("option[value='Third']",
        																				"Third Choice"
        																			)
        																		]
        																	)
        																]
        															),
        															m(".w-col.w-col-6")
        														]
        													)
        												]
        											),
        											m(".w-form-done",
        												m("p",
        													"Thank you! Your submission has been received!"
        												)
        											),
        											m(".w-form-fail",
        												m("p",
        													"Oops! Something went wrong while submitting the form :("
        												)
        											)
        										]
        									),
        									m(".w-row",
        										[
        											m(".w-col.w-col-2"),
        											m(".w-col.w-col-8",
        												[
        													m("a.btn.btn-large.u-marginbottom-20[href='#']",
        														"Finalizar pagamento"
        													),
        													m(".fontsize-smallest.u-text-center",
        														[
        															"Ao apoiar, você concorda com os ",
        															m("a.alt-link[href='#']",
        																"Termos de Uso"
        															),
        															m.trust("&nbsp;"),
        															"e ",
        															m("a.alt-link[href='#']",
        																"Política de Privacidade"
        															)
        														]
        													)
        												]
        											),
        											m(".w-col.w-col-2")
        										]
        									)
        								]
        							)
        						]
        					),
        					m(".w-col.w-col-4",
        						[
        							m(".w-hidden-small.w-hidden-tiny.card.u-radius.u-marginbottom-20",
        								[
        									m(".fontsize-smaller.fontweight-semibold.u-marginbottom-20",
        										"Valor do apoio"
        									),
        									m(".w-clearfix.u-marginbottom-20",
        										[
        											m(".fontsize-larger.text-success.u-left",
        												"R$15"
        											),
        											m("a.fontsize-small.link-hidden.u-right.fontweight-semibold[href='#']",
        												"Editar"
        											)
        										]
        									),
        									m(".back-payment-info-reward",
        										[
        											m(".fontsize-smaller.fontweight-semibold.u-marginbottom-10",
        												"Recompensa selecionada"
        											),
        											m(".fontsize-smallest",
        												[
        													"Com esse apoio seu nome ficará",
        													m.trust("&nbsp;"),
        													"gravado no vídeo de agradecimento dos vídeos produzidos e dos agradecimentos dos vídeos e também no agradecimento dos vídeos isso isso isso e também no agradecimento dos vídeos"
        												]
        											)
        										]
        									)
        								]
        							),
        							m(".w-hidden-small.w-hidden-tiny.card.u-radius[data-ix='new-interaction']",
        								[
        									m(".fontsize-small.fontweight-semibold.u-marginbottom-20",
        										"Quero apoiar, e agora?"
        									),
        									m("ul.w-list-unstyled",
        										[
        											m("li.fontsize-smaller.alt-link.list-question",
        												m("div",
        													[
        														m("span.fa.fa-angle-right",
        															"."
        														),
        														" Como eu apoio este projeto?"
        													]
        												)
        											),
        											m("li.u-marginbottom-10.fontsize-smaller.fontweight-semibold",
        												m("div",
        													[
        														m("span.faq-box-arrow", {style: {"font-weight": "800"}}),
        														m("span.fa.fa-angle-down",
        															"."
        														),
        														m.trust("&nbsp;"),
        														m.trust("&nbsp;"),
        														"Quando o pagamento é efetivado?"
        													]
        												)
        											),
        											m("li",
        												m("p.list-answer.fontsize-smaller",
        													"Assim que o MoIP ou o Paypal confirmar a transação. Se você pagou com cartão, a confirmação deverá ser no mesmo dia. Se foi com boleto, em até 4 dias úteis."
        												)
        											),
        											m("li.alt-link.fontsize-smaller.list-question",
        												m("div",
        													[
        														m("span.faq-box-arrow", {style: {"font-weight": "800"}},
        															"+"
        														),
        														m.trust("&nbsp;"),
        														m.trust("&nbsp;"),
        														"E se o projeto não atingir a meta?"
        													]
        												)
        											),
        											m("li.fontsize-smaller.alt-link.list-question",
        												m("div",
        													[
        														m("span.faq-box-arrow",
        															"+"
        														),
        														" ",
        														m.trust("&nbsp;"),
        														"E se eu eu não quiser usar os créditos do Catarse?"
        													]
        												)
        											),
        											m("li.alt-link.fontsize-smaller.list-question",
        												m("div",
        													[
        														m("span.faq-box-arrow",
        															"+"
        														),
        														" ",
        														m.trust("&nbsp;"),
        														"Se o projeto for financiado, como receberei minha recompensa?"
        													]
        												)
        											)
        										]
        									),
        									m(".list-question")
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
