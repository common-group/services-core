import m from 'mithril';
import h from '../h';
import rewardVM from '../vms/reward-vm';
import paymentVM from '../vms/payment-vm';
import projectVM from '../vms/project-vm';
import faqBox from '../c/faq-box';
import paymentForm from '../c/payment-form';
import inlineError from '../c/inline-error';

const projectsPayment = {
    controller(args) {
        const mode = projectVM.currentProject().mode,
            projectUserId = projectVM.currentProject().user_id,
            value = rewardVM.getValue(),
            vm = paymentVM(mode),
            showPaymentForm = m.prop(false),
            reward = rewardVM.selectedReward,
            documentMask = _.partial(h.mask, '999.999.999-99'),
            zipcodeMask = _.partial(h.mask, '99999-999');

        const validateForm = () => {
            if(vm.validate()) {
                showPaymentForm(true);
            }
        };

        const fieldHasError = (fieldName) => {
            const fieldWithError = _.findWhere(vm.fields.errors(), {field: fieldName});

            return fieldWithError ? m.component(inlineError, {message: fieldWithError.message}) : '';
        };

        const applyDocumentMask = _.compose(vm.fields.ownerDocument, documentMask);

        const applyZipcodeMask = _.compose(vm.fields.zipcode, zipcodeMask);

        if(!h.getUser()) {
            return h.navigateToDevise();
        }

        return {
            applyDocumentMask: applyDocumentMask,
            applyZipcodeMask: applyZipcodeMask,
            fieldHasError: fieldHasError,
            validateForm: validateForm,
            projectUserId: projectUserId,
            showPaymentForm: showPaymentForm,
            reward: reward,
            value: value,
            mode: mode,
            vm: vm
        }
    },
    view(ctrl, args) {
        return m(".w-section.w-clearfix.section",
        	[
        		m(".w-col",
        			m(".w-clearfix.w-hidden-main.w-hidden-medium.card.u-radius.u-marginbottom-20",
        				[
        					m(".fontsize-smaller.fontweight-semibold",
        						"Valor do apoio"
        					),
        					m("a.w-inline-block.arrow-admin.fa.fa-chevron-down.fontcolor-secondary[data-ix='show-reward-details'][data-vivaldi-spatnav-clickable='1'][href='#']"),
        					m(".w-clearfix.u-marginbottom-20",
        						m(".fontsize-larger.text-success.u-left",
        							`R$${ctrl.value}`
        						)
        					),
        					m(".w-clearfix.back-payment-info-reward[data-ix='display-none-on-load']", {style: {"display": "none"}},
        						[
        							m(".fontsize-smaller.fontweight-semibold.u-marginbottom-10",
        								"Recompensa selecionada"
        							),
        							m(".fontsize-smallest", `${ctrl.reward().description}`),
        							m(`a.fontsize-small.link-hidden.u-right.fontweight-semibold[href="/projects/${projectVM.currentProject().id}/contribution"]`, {
                                        config: m.route
                                    }, "Editar"
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
        							ctrl.vm.fields.errors() ? m(".w-hidden-main.w-hidden-medium.w-hidden-small.w-hidden-tiny.card.card-error.u-radius.zindex-10.u-marginbottom-30.fontsize-smaller[data-ix='display-none-on-load']", {style: {"display": "block"}},
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
        							) : '',
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
        													m(".w-col.w-col-7.w-sub-col",
        														[
        															m("label.field-label.fontweight-semibold[for='complete-name']",
        																"Nome completo *"
        															),
        															m("input.w-input.text-field[id='complete-name'][name='complete-name']", {
                                                                        onfocus: ctrl.vm.resetFieldError('completeName'),
                                                                        class: ctrl.fieldHasError('completeName') ? 'error' : false,
                                                                        type: 'text',
                                                                        onchange: m.withAttr('value', ctrl.vm.fields.completeName),
                                                                        value: ctrl.vm.fields.completeName(),
                                                                        required: 'required',
                                                                        placeholder: 'Nome Completo'
                                                                    }),
                                                                    ctrl.fieldHasError('completeName')
        														]
        													),
        													m(".w-col.w-col-5",
        														[
        															m("label.field-label.fontweight-semibold[for='email']",
        																"Email *"
        															),
        															m("input.w-input.text-field[id='email']", {
                                                                        onfocus: ctrl.vm.resetFieldError('email'),
                                                                        class: ctrl.fieldHasError('email') ? 'error' : false,
                                                                        type: 'email',
                                                                        onchange: m.withAttr('value', ctrl.vm.fields.email),
                                                                        value: ctrl.vm.fields.email(),
                                                                        required: 'required',
                                                                        placeholder: 'email@catarse.me'
                                                                    }),
                                                                    ctrl.fieldHasError('email')
        														]
        													)
        												]
        											),
        											m(".w-checkbox.w-clearfix",
        												[
        													m("input.w-checkbox-input[id='anonymous'][name='anonymous'][type='checkbox']", {
                                                                onchange: m.withAttr('value', ctrl.vm.fields.anonymous),
                                                                checked: ctrl.vm.fields.anonymous(),
                                                            }),
        													m("label.w-form-label.fontsize-smallest[for='anonymous']",
        														"Quero que meu apoio não fique público"
        													)
        												]
        											),
        											ctrl.vm.fields.anonymous() ? m(".card.card-message.u-radius.zindex-10.fontsize-smallest",
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
        											) : ''
        										]
        									)
        								]
        							),
        							m(".u-marginbottom-40",
        								m(".w-form",
        									[
												m(".w-row",
													[
														m(".w-col.w-col-6.w-sub-col",
															[
																m("label.field-label.fontweight-semibold[for='country']",
																	"País *"
																),
																m("select.w-select.text-field[id='country']",
                                                                    {
                                                                        onchange: m.withAttr('value', ctrl.vm.fields.userCountryId),
                                                                        value: ctrl.vm.fields.userCountryId()
                                                                    },
                                                                    _.map(ctrl.vm.fields.countries(), (country, idx) => m("option", {value: country.id, key: idx, selected: country.id === ctrl.vm.fields.userCountryId()}, country.name))
																)
															]
														),
														m(".w-col.w-col-6",
															!ctrl.vm.isInternational() ? [
																m("label.field-label.fontweight-semibold[for='zip-code']",
																	"CEP"
																),
																m("input.w-input.text-field[id='zip-code']", {
                                                                    type: 'tel',
                                                                    onkeyup: m.withAttr('value', ctrl.applyZipcodeMask),
                                                                    value: ctrl.vm.fields.zipCode(),
                                                                    placeholder: '42100000'
                                                                })
															] : ''
														)
													]
												),
												m(".w-row",
													[
														m(".w-col.w-col-6.w-sub-col",
															[
																m("label.field-label.fontweight-semibold[for='street']",
																	"Rua *"
																),
																m("input.w-input.text-field[id='street']", {
                                                                    onfocus: ctrl.vm.resetFieldError('street'),
                                                                    class: ctrl.fieldHasError('street') ? 'error' : false,
                                                                    type: 'text',
                                                                    onchange: m.withAttr('value', ctrl.vm.fields.street),
                                                                    value: ctrl.vm.fields.street(),
                                                                    required: 'required',
                                                                    placeholder: 'Rua Da Minha Casa'
                                                                }),
                                                                ctrl.fieldHasError('street')
															]
														),
														m(".w-col.w-col-6",
															m(".w-row",
																[
																	m(".w-col.w-col-6.w-col-small-6.w-col-tiny-6.w-sub-col-middle",
																		[
																			m("label.field-label.fontweight-semibold[for='number']",
																				"Número *"
																			),
																			m("input.w-input.text-field[id='number']", {
                                                                                onfocus: ctrl.vm.resetFieldError('number'),
                                                                                class: ctrl.fieldHasError('number') ? 'error' : false,
                                                                                type: 'text',
                                                                                onchange: m.withAttr('value', ctrl.vm.fields.number),
                                                                                value: ctrl.vm.fields.number(),
                                                                                required: 'required',
                                                                                placeholder: '421'
                                                                            }),
                                                                            ctrl.fieldHasError('number')
																		]
																	),
																	m(".w-col.w-col-6.w-col-small-6.w-col-tiny-6",
																		[
																			m("label.field-label.fontweight-semibold[for='address-complement']",
																				"Complemento"
																			),
																			m("input.w-input.text-field[id='address-complement']", {
                                                                                onfocus: ctrl.vm.resetFieldError('addressComplement'),
                                                                                class: ctrl.fieldHasError('addressComplement') ? 'error' : false,
                                                                                type: 'text',
                                                                                onchange: m.withAttr('value', ctrl.vm.fields.addressComplement),
                                                                                value: ctrl.vm.fields.addressComplement(),
                                                                                placeholder: 'Residencial 123'
                                                                            }),
                                                                            ctrl.fieldHasError('addressComplement')
																		]
																	)
																]
															)
														)
													]
												),
												m(".w-row",
													[
														m(".w-col.w-col-4.w-sub-col",
															[
																m("label.field-label.fontweight-semibold[for='neighbourhood']",
																	"Bairro *"
																),
																m("input.w-input.text-field[id='neighbourhood']", {
                                                                    onfocus: ctrl.vm.resetFieldError('neighbourhood'),
                                                                    class: ctrl.fieldHasError('neighbourhood') ? 'error' : false,
                                                                    type: 'text',
                                                                    onchange: m.withAttr('value', ctrl.vm.fields.neighbourhood),
                                                                    value: ctrl.vm.fields.neighbourhood(),
                                                                    required: 'required',
                                                                    placeholder: 'São José'
                                                                }),
                                                                ctrl.fieldHasError('neighbourhood')
															]
														),
														m(".w-col.w-col-4.w-sub-col",
															[
																m("label.field-label.fontweight-semibold[for='city']",
																	"Cidade *"
																),
																m("input.w-input.text-field[id='city']", {
                                                                    onfocus: ctrl.vm.resetFieldError('city'),
                                                                    class: ctrl.fieldHasError('city') ? 'error' : false,
                                                                    type: 'text',
                                                                    onchange: m.withAttr('value', ctrl.vm.fields.city),
                                                                    value: ctrl.vm.fields.city(),
                                                                    required: 'required',
                                                                    placeholder: 'Cidade'
                                                                }),
                                                                ctrl.fieldHasError('city')
															]
														),
														m(".w-col.w-col-4",
															[
																m("label.field-label.fontweight-semibold[for='state']",
																	"Estado *"
																),
																m("select.w-select.text-field[id='state']",
                                                                    {
                                                                        onchange: m.withAttr('value', ctrl.vm.fields.userState),
                                                                        value: ctrl.vm.fields.userState()
                                                                    },
                                                                    _.map(ctrl.vm.fields.states(), (state, idx) => m('option', {value: state.acronym, selected: state.acronym === ctrl.vm.fields.userState()}, state.name))
																)
															]
														)
													]
												),
												!ctrl.vm.isInternational() ? m(".w-row",
													[
														m(".w-col.w-col-6.w-sub-col",
															[
																m("label.field-label.fontweight-semibold[for='document']",
																	"CPF *"
																),
																m("input.w-input.text-field[id='document']", {
                                                                    onfocus: ctrl.vm.resetFieldError('ownerDocument'),
                                                                    class: ctrl.fieldHasError('ownerDocument') ? 'error' : false,
                                                                    type: 'tel',
                                                                    onkeyup: m.withAttr('value', ctrl.applyDocumentMask),
                                                                    value: ctrl.vm.fields.ownerDocument(),
                                                                    required: 'required'
                                                                }),
                                                                ctrl.fieldHasError('ownerDocument')
															]
														),
														m(".w-col.w-col-6",
															[
																m("label.field-label.fontweight-semibold[for='phone']",
																	"Telefone *"
																),
																m("input.w-input.text-field[id='phone']", {
                                                                    onfocus: ctrl.vm.resetFieldError('phone'),
                                                                    class: ctrl.fieldHasError('phone') ? 'error' : false,
                                                                    type: 'tel',
                                                                    onchange: m.withAttr('value', ctrl.vm.fields.phone),
                                                                    value: ctrl.vm.fields.phone(),
                                                                    required: 'required'
                                                                }),
                                                                ctrl.fieldHasError('phone')
															]
														)
													]
												) : ''
        									]
        								)
        							),
                                    m(".w-row.u-marginbottom-40",
                                        m(".w-col.w-col-push-3.w-col-6",
                                            m("button.btn.btn-large",
                                                {
                                                    onclick: ctrl.validateForm
                                                },
                                                "Próximo passo"
                                            )
                                        )
                                    ),
                                    ctrl.showPaymentForm() ? m.component(paymentForm) : ''
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
        												`R$${ctrl.value}`
        											),
        											m(`a.fontsize-small.link-hidden.u-right.fontweight-semibold[href="/projects/${projectVM.currentProject().id}/contribution"]`, {
                                                            config: m.route
                                                        },"Editar"
        											)
        										]
        									),
        									m(".back-payment-info-reward",
        										[
        											m(".fontsize-smaller.fontweight-semibold.u-marginbottom-10",
        												"Recompensa selecionada"
        											),
        											m(".fontsize-smallest", ctrl.reward().description)

        										]
        									)
        								]
        							),
        							m.component(faqBox, {mode: ctrl.mode, faq: ctrl.vm.faq, projectUserId: ctrl.projectUserId})
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
