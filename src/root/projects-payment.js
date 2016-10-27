import m from 'mithril';
import I18n from 'i18n-js';
import h from '../h';
import contributionVM from '../vms/contribution-vm';
import rewardVM from '../vms/reward-vm';
import paymentVM from '../vms/payment-vm';
import projectVM from '../vms/project-vm';
import faqBox from '../c/faq-box';
import paymentForm from '../c/payment-form';
import inlineError from '../c/inline-error';

const I18nScope = _.partial(h.i18nScope, 'projects.contributions');

const projectsPayment = {
    controller(args) {
        const project = projectVM.getCurrentProject(),
            mode = project.mode,
            projectUserId = project.user.id,
            vm = paymentVM(mode),
            showPaymentForm = m.prop(false),
            contribution = contributionVM.getCurrentContribution(),
            reward = m.prop(contribution().reward),
            value = contribution().value,
            phoneMask = _.partial(h.mask, '(99) 9999-99999'),
            documentMask = _.partial(h.mask, '999.999.999-99'),
            zipcodeMask = _.partial(h.mask, '99999-999');

        //Teste para verificarmos se o chat nessa página irá trazer maior num. contribuições.
        if(_.contains([41679,40191,40271,38768,42815,43002,42129,41867,39655], project.project_id)) {
            (window.$zopim && window.$zopim.livechat)||(function(d,s){var z=window.$zopim=function(c){z._.push(c)},$=z.s=d.createElement(s),e=d.getElementsByTagName(s)[0];z.set=function(o){z.set._.push(o)};z._=[];z.set._=[];$.async=!0;$.setAttribute('charset','utf-8');$.src='//v2.zopim.com/?2qPtIfZX0Exh5Szx5JUoUxWKqrTQI5Tm';z.t=+new Date;$.type='text/javascript';e.parentNode.insertBefore($,e)})(document,'script');
            setTimeout(function t(){
                const c = window.$zopim && window.$zopim.livechat;
                if(c) {
                    const u = h.getUser();
                    if(u) {
                        c.setEmail(u.email);
                        c.setName(u.name);
                    }
                    window.zE && window.zE.hide();
                } else {
                    setTimeout(t, 1000);
                }
            }, 1000);
        }

        const validateForm = () => {
            if (vm.validate()) {
                showPaymentForm(true);
            }
        };

        const fieldHasError = (fieldName) => {
            const fieldWithError = _.findWhere(vm.fields.errors(), {
                field: fieldName
            });

            return fieldWithError ? m.component(inlineError, {
                message: fieldWithError.message
            }) : '';
        };

        const setStateOther = (el, isInit) => {
            if (!isInit) {
                vm.fields.userState('');
            }
        };

        const applyDocumentMask = _.compose(vm.fields.ownerDocument, documentMask);

        const applyZipcodeMask = _.compose(vm.fields.zipCode, zipcodeMask);

        const applyPhoneMask = _.compose(vm.fields.phone, phoneMask);

        const addressChange = (fn) => (e) => {
            CatarseAnalytics.oneTimeEvent({
                cat: 'contribution_finish',
                act: vm.isInternational ? 'contribution_address_br' : 'contribution_address_int'
            });

            if(_.isFunction(fn)){
                fn(e);
            }
        };

        if (!h.getUser()) {
            return h.navigateToDevise();
        }

        return {
            addressChange: addressChange,
            applyDocumentMask: applyDocumentMask,
            applyZipcodeMask: applyZipcodeMask,
            applyPhoneMask: applyPhoneMask,
            fieldHasError: fieldHasError,
            setStateOther: setStateOther,
            validateForm: validateForm,
            projectUserId: projectUserId,
            showPaymentForm: showPaymentForm,
            contribution: contribution,
            reward: reward,
            value: value,
            mode: mode,
            vm: vm
        };
    },
    view(ctrl, args) {
        return m('#project-payment.w-section.w-clearfix.section', [
            m('.w-col',
                m('.w-clearfix.w-hidden-main.w-hidden-medium.card.u-radius.u-marginbottom-20', [
                    m('.fontsize-smaller.fontweight-semibold',
                        'Valor do apoio'
                    ),
                    m('a.w-inline-block.arrow-admin.fa.fa-chevron-down.fontcolor-secondary[href=\'#\']'),
                    m('.w-clearfix.u-marginbottom-20',
                        m('.fontsize-larger.text-success.u-left',
                            `R$ ${Number(ctrl.value).toFixed()}`
                        )
                    ),
                    m('.w-clearfix.back-payment-info-reward', {
                        style: {
                            'display': 'none'
                        }
                    }, [
                        m('.fontsize-smaller.fontweight-semibold.u-marginbottom-10',
                            'Recompensa selecionada'
                        ),
                        m('.fontsize-smallest', `${ctrl.reward().description}`),
                        m(`a.fontsize-small.link-hidden.u-right.fontweight-semibold[href="/projects/${projectVM.currentProject().project_id}/contributions/new"]`, 'Editar')
                    ])
                ])
            ),
            m('.w-container',
                m('.w-row', [
                    m('.w-col.w-col-8', [!_.isEmpty(ctrl.vm.fields.errors()) ? m('.card.card-error.u-radius.zindex-10.u-marginbottom-30.fontsize-smaller[data-ix=\'display-none-on-load\']',
                            m('.u-marginbottom-10.fontweight-bold', [
                                'Por favor, reveja os campos abaixo antes de prosseguir',
                                m('.errors', _.map(ctrl.vm.fields.errors(), (error) => m('p', error.message)))
                            ])
                        ) : '',
                        m('.w-form', [
                            m('form.u-marginbottom-40[data-name=\'Email Form\'][id=\'email-form\'][name=\'email-form\']', [
                                m('.u-marginbottom-40.u-text-center-small-only', [
                                    m('.fontweight-semibold.lineheight-tight.fontsize-large',
                                        'Dados de contato e endereço'
                                    ),
                                    m('.fontsize-smaller',
                                        '* Preenchimento obrigatório'
                                    )
                                ]),
                                m('.w-row', [
                                    m('.w-col.w-col-7.w-sub-col', [
                                        m('label.field-label.fontweight-semibold[for=\'complete-name\']',
                                            'Nome completo *'
                                        ),
                                        m('input.w-input.text-field[id=\'complete-name\'][name=\'complete-name\']', {
                                            onfocus: ctrl.vm.resetFieldError('completeName'),
                                            class: ctrl.fieldHasError('completeName') ? 'error' : false,
                                            type: 'text',
                                            onchange: m.withAttr('value', ctrl.vm.fields.completeName),
                                            value: ctrl.vm.fields.completeName(),
                                            required: 'required',
                                            placeholder: 'Nome Completo'
                                        }),
                                        ctrl.fieldHasError('completeName')
                                    ]),
                                    m('.w-col.w-col-5', [
                                        m('label.field-label.fontweight-semibold[for=\'email\']',
                                            'Email *'
                                        ),
                                        m('input.w-input.text-field[id=\'email\']', {
                                            onfocus: ctrl.vm.resetFieldError('email'),
                                            class: ctrl.fieldHasError('email') ? 'error' : false,
                                            type: 'email',
                                            onchange: m.withAttr('value', ctrl.vm.fields.email),
                                            value: ctrl.vm.fields.email(),
                                            required: 'required',
                                            placeholder: 'email@catarse.me'
                                        }),
                                        ctrl.fieldHasError('email')
                                    ])
                                ]),
                                m('.w-checkbox.w-clearfix', [
                                    m('input.w-checkbox-input[id=\'anonymous\'][name=\'anonymous\'][type=\'checkbox\']', {
                                        onclick: () => CatarseAnalytics.event({cat:'contribution_finish',act:'contribution_anonymous_change'}),
                                        onchange: m.withAttr('value', ctrl.vm.fields.anonymous),
                                        checked: ctrl.vm.fields.anonymous(),
                                    }),
                                    m('label.w-form-label.fontsize-smallest[for=\'anonymous\']',
                                        'Quero que meu apoio não fique público'
                                    )
                                ]),
                                ctrl.vm.fields.anonymous() ? m('.card.card-message.u-radius.zindex-10.fontsize-smallest',
                                    m('div', [
                                        m('span.fontweight-bold', [
                                            I18n.t('edit.anonymous_confirmation_title', I18nScope()),
                                            m('br')
                                        ]),
                                        m('br'),
                                        I18n.t('edit.anonymous_confirmation', I18nScope())
                                    ])
                                ) : ''
                            ])
                        ]),
                        m('.u-marginbottom-40',
                            m('.w-form', [
                                m('.w-row', [
                                    m('.w-col.w-col-6.w-sub-col', [
                                        m('label.field-label.fontweight-semibold[for=\'country\']',
                                            'País *'
                                        ),
                                        m('select.w-select.text-field[id=\'country\']', {
                                                onfocus: ctrl.vm.resetFieldError('userCountryId'),
                                                class: ctrl.fieldHasError('userCountryId') ? 'error' : false,
                                                onchange: m.withAttr('value', ctrl.vm.fields.userCountryId),
                                                value: ctrl.vm.fields.userCountryId()
                                            },
                                            _.map(ctrl.vm.fields.countries(), (country, idx) => m('option', {
                                                value: country.id,
                                                key: idx,
                                                selected: country.id === ctrl.vm.fields.userCountryId()
                                            }, country.name))
                                        ),
                                        ctrl.fieldHasError('userCountryId')
                                    ]),
                                    m('.w-col.w-col-6', [
                                        m('label.field-label.fontweight-semibold[for=\'zip-code\']',
                                            !ctrl.vm.isInternational() ? 'CEP *' : 'ZIP'
                                        ),
                                        m('input.w-input.text-field[id=\'zip-code\']', {
                                            type: 'tel',
                                            onfocus: ctrl.vm.resetFieldError('zipCode'),
                                            class: ctrl.fieldHasError('zipCode') ? 'error' : false,
                                            onchange: ctrl.addressChange(),
                                            onkeyup: m.withAttr('value', (value) => !ctrl.vm.isInternational() ? ctrl.applyZipcodeMask(value) : ctrl.vm.fields.zipCode(value)),
                                            value: ctrl.vm.fields.zipCode(),
                                            placeholder: '42100000'
                                        }),
                                        ctrl.fieldHasError('zipCode')
                                    ])
                                ]),
                                m('.w-row', [
                                    m('.w-col.w-col-6.w-sub-col', [
                                        m('label.field-label.fontweight-semibold[for=\'street\']',
                                            'Rua *'
                                        ),
                                        m('input.w-input.text-field[id=\'street\']', {
                                            onfocus: ctrl.vm.resetFieldError('street'),
                                            class: ctrl.fieldHasError('street') ? 'error' : false,
                                            type: 'text',
                                            onchange: ctrl.addressChange(m.withAttr('value', ctrl.vm.fields.street)),
                                            value: ctrl.vm.fields.street(),
                                            required: 'required',
                                            placeholder: 'Rua Da Minha Casa'
                                        }),
                                        ctrl.fieldHasError('street')
                                    ]),
                                    m('.w-col.w-col-6',
                                        m('.w-row', [
                                            m('.w-col.w-col-6.w-col-small-6.w-col-tiny-6.w-sub-col-middle', [
                                                m('label.field-label.fontweight-semibold[for=\'number\']',
                                                    'Número *'
                                                ),
                                                m('input.w-input.text-field[id=\'number\']', {
                                                    onfocus: ctrl.vm.resetFieldError('number'),
                                                    class: ctrl.fieldHasError('number') ? 'error' : false,
                                                    type: 'text',
                                                    onchange: ctrl.addressChange(m.withAttr('value', ctrl.vm.fields.number)),
                                                    value: ctrl.vm.fields.number(),
                                                    required: 'required',
                                                    placeholder: '421'
                                                }),
                                                ctrl.fieldHasError('number')
                                            ]),
                                            m('.w-col.w-col-6.w-col-small-6.w-col-tiny-6', [
                                                m('label.field-label.fontweight-semibold[for=\'address-complement\']',
                                                    'Complemento'
                                                ),
                                                m('input.w-input.text-field[id=\'address-complement\']', {
                                                    onfocus: ctrl.vm.resetFieldError('addressComplement'),
                                                    class: ctrl.fieldHasError('addressComplement') ? 'error' : false,
                                                    type: 'text',
                                                    onchange: ctrl.addressChange(m.withAttr('value', ctrl.vm.fields.addressComplement)),
                                                    value: ctrl.vm.fields.addressComplement(),
                                                    placeholder: 'Residencial 123'
                                                }),
                                                ctrl.fieldHasError('addressComplement')
                                            ])
                                        ])
                                    )
                                ]),
                                m('.w-row', [
                                    m('.w-col.w-col-4.w-sub-col', [
                                        m('label.field-label.fontweight-semibold[for=\'neighbourhood\']',
                                            `Bairro ${ctrl.vm.isInternational() ? '' : '*'}`
                                        ),
                                        m('input.w-input.text-field[id=\'neighbourhood\']', {
                                            onfocus: ctrl.vm.resetFieldError('neighbourhood'),
                                            class: ctrl.fieldHasError('neighbourhood') ? 'error' : false,
                                            type: 'text',
                                            onchange: ctrl.addressChange(m.withAttr('value', ctrl.vm.fields.neighbourhood)),
                                            value: ctrl.vm.fields.neighbourhood(),
                                            required: !ctrl.vm.isInternational(),
                                            placeholder: 'São José'
                                        }),
                                        ctrl.fieldHasError('neighbourhood')
                                    ]),
                                    m('.w-col.w-col-4.w-sub-col', [
                                        m('label.field-label.fontweight-semibold[for=\'city\']',
                                            'Cidade *'
                                        ),
                                        m('input.w-input.text-field[id=\'city\']', {
                                            onfocus: ctrl.vm.resetFieldError('city'),
                                            class: ctrl.fieldHasError('city') ? 'error' : false,
                                            type: 'text',
                                            onchange: ctrl.addressChange(m.withAttr('value', ctrl.vm.fields.city)),
                                            value: ctrl.vm.fields.city(),
                                            required: 'required',
                                            placeholder: 'Cidade'
                                        }),
                                        ctrl.fieldHasError('city')
                                    ]),
                                    m('.w-col.w-col-4', [
                                        m('label.field-label.fontweight-semibold[for=\'state\']',
                                            'Estado *'
                                        ),
                                        ctrl.vm.isInternational() ? m('input.w-input.text-field[id=\'address-state\']', {
                                            onchange: ctrl.addressChange(m.withAttr('value', ctrl.vm.fields.userState)),
                                            value: ctrl.vm.fields.userState()
                                        }) : m('select.w-select.text-field[id=\'address-state\']', {
                                                onfocus: ctrl.vm.resetFieldError('userState'),
                                                class: ctrl.fieldHasError('userState') ? 'error' : false,
                                                onchange: ctrl.addressChange(m.withAttr('value', ctrl.vm.fields.userState)),
                                                value: ctrl.vm.fields.userState()
                                            }, _.map(ctrl.vm.fields.states(), (state, idx) => m('option', {
                                                    value: state.acronym,
                                                    selected: state.acronym === ctrl.vm.fields.userState()
                                            }, state.name))
                                        ),
                                        ctrl.fieldHasError('userState')
                                    ])
                                ]), !ctrl.vm.isInternational() ? m('.w-row', [
                                    m('.w-col.w-col-6.w-sub-col', [
                                        m('label.field-label.fontweight-semibold[for=\'document\']',
                                            'CPF *'
                                        ),
                                        m('input.w-input.text-field[id=\'document\']', {
                                            onfocus: ctrl.vm.resetFieldError('ownerDocument'),
                                            class: ctrl.fieldHasError('ownerDocument') ? 'error' : false,
                                            type: 'tel',
                                            onkeyup: m.withAttr('value', ctrl.applyDocumentMask),
                                            value: ctrl.vm.fields.ownerDocument(),
                                            required: 'required'
                                        }),
                                        ctrl.fieldHasError('ownerDocument')
                                    ]),
                                    m('.w-col.w-col-6', [
                                        m('label.field-label.fontweight-semibold[for=\'phone\']',
                                            'Telefone *'
                                        ),
                                        m('input.w-input.text-field[id=\'phone\']', {
                                            onfocus: ctrl.vm.resetFieldError('phone'),
                                            class: ctrl.fieldHasError('phone') ? 'error' : false,
                                            type: 'tel',
                                            onkeyup: m.withAttr('value', ctrl.applyPhoneMask),
                                            value: ctrl.vm.fields.phone(),
                                            required: 'required'
                                        }),
                                        ctrl.fieldHasError('phone')
                                    ])
                                ]) : ''
                            ])
                        ),
                        m('.w-row.u-marginbottom-40',
                            m('.w-col.w-col-push-3.w-col-6',
                                m('button.btn.btn-large', {
                                        onclick: () => CatarseAnalytics.event({cat:'contribution_finish',act:'contribution_next_click'}, ctrl.validateForm)
                                    },
                                    'Próximo passo'
                                )
                            )
                        ),
                        ctrl.showPaymentForm() ? m.component(paymentForm, {
                            vm: ctrl.vm,
                            contribution_id: ctrl.contribution().id,
                            project_id: projectVM.currentProject().project_id,
                            user_id: h.getUser().user_id
                        }) : ''
                    ]),
                    m('.w-col.w-col-4', [
                        m('.w-hidden-small.w-hidden-tiny.card.u-radius.u-marginbottom-20', [
                            m('.fontsize-smaller.fontweight-semibold.u-marginbottom-20',
                                'Valor do apoio'
                            ),
                            m('.w-clearfix.u-marginbottom-20', [
                                m('.fontsize-larger.text-success.u-left',
                                    `R$ ${Number(ctrl.value).toFixed()}`
                                ),
                                m(`a.fontsize-small.link-hidden.u-right.fontweight-semibold[href="/projects/${projectVM.currentProject().project_id}/contributions/new${ctrl.reward().id ? '?reward_id=' + ctrl.reward().id : '' }"]`, 'Editar')
                            ]),
                            m('.back-payment-info-reward', [
                                m('.fontsize-smaller.fontweight-semibold.u-marginbottom-10',
                                    'Recompensa selecionada'
                                ),
                                m('.fontsize-smallest', ctrl.reward().description ? ctrl.reward().description : `Você irá apoiar com R$ ${Number(ctrl.value).toFixed()} e não quer nenhuma recompensa por seu apoio.`)

                            ])
                        ]),
                        m.component(faqBox, {
                            mode: ctrl.mode,
                            faq: ctrl.vm.faq,
                            projectUserId: ctrl.projectUserId
                        })
                    ])
                ])
            )
        ]);
    }
};

export default projectsPayment;
