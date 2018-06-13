import m from 'mithril';
import _ from 'underscore';
import I18n from 'i18n-js';
import h from '../h';
import tooltip from './tooltip';
import creditCardVM from '../vms/credit-card-vm';
import projectVM from '../vms/project-vm';
import creditCardInput from './credit-card-input';
import inlineError from './inline-error';
import subscriptionEditModal from './subscription-edit-modal';
import commonPaymentVM from '../vms/common-payment-vm';

const I18nScope = _.partial(h.i18nScope, 'projects.contributions.edit');
const I18nIntScope = _.partial(h.i18nScope, 'projects.contributions.edit_international');

const paymentCreditCard = {
    controller(args) {
        const vm = args.vm,
            isSubscriptionEdit = args.isSubscriptionEdit || m.prop(false),
            subscriptionEditConfirmed = m.prop(false),
            confirmSubscriptionChanges = m.prop(false),
            showSubscriptionModal = m.prop(false),
            loadingInstallments = m.prop(true),
            loadingSavedCreditCards = m.prop(true),
            selectedCreditCard = m.prop({ id: -1 }),
            selectedInstallment = m.prop('1'),
            showForm = m.prop(false),
            creditCardType = m.prop('unknown'),
            documentMask = _.partial(h.mask, '999.999.999-99'),
            documentCompanyMask = _.partial(h.mask, '99.999.999/9999-99');

        const sendSubscriptionPayment = (selectedCreditCard, vm, commonData) => {
            if (!isSubscriptionEdit()) {
                commonPaymentVM.sendCreditCardPayment(selectedCreditCard, vm, commonData, args.addressVM);

                return false;
            }

            if (!subscriptionEditConfirmed() && !args.isReactivation()) {
                showSubscriptionModal(true);

                return false;
            }

            const data = _.extend({}, commonData, {subscription_id: args.subscriptionId()});

            commonPaymentVM.sendCreditCardPayment(
                selectedCreditCard,
                vm,
                data,
                args.addressVM
            );

            return false;
        };

        const onSubmit = () => {
            vm.creditCardFields.errors([]);

            if (selectedCreditCard().id === -1) {
                checkExpiry();
                checkcvv();
                checkCreditCard();
                checkCreditCardName();
            }

            if (vm.creditCardFields.errors().length === 0) {
                if (args.isSubscription) {
                    const commonData = {
                        rewardCommonId: args.reward_common_id,
                        userCommonId: args.user_common_id,
                        projectCommonId: args.project_common_id,
                        amount: args.value * 100
                    };
                    sendSubscriptionPayment(selectedCreditCard, vm, commonData);
                } else {
                    vm.sendPayment(selectedCreditCard, selectedInstallment, args.contribution_id, args.project_id);
                }
            }

            return false;
        };

        const handleValidity = (isValid, errorObj) => {
            if (!isValid) {
                vm.creditCardFields.errors().push(errorObj);
            } else {
                const errorsWithout = _.reject(vm.creditCardFields.errors(), err => _.isEqual(err, errorObj));
                vm.creditCardFields.errors(errorsWithout);
            }
        };

        const checkcvv = () => {
            const isValid = creditCardVM.validateCardcvv(vm.creditCardFields.cvv(), creditCardType()),
                errorObj = { field: 'cvv', message: I18n.t('errors.inline.creditcard_cvv', scope()) };

            handleValidity(isValid, errorObj);
        };

        const checkExpiry = () => {
            const isValid = creditCardVM.validateCardExpiry(vm.creditCardFields.expMonth(), vm.creditCardFields.expYear()),
                errorObj = { field: 'expiry', message: I18n.t('errors.inline.creditcard_expiry', scope()) };

            handleValidity(isValid, errorObj);
        };

        const checkCreditCard = () => {
            const isValid = creditCardVM.validateCardNumber(vm.creditCardFields.number()),
                errorObj = { field: 'number', message: I18n.t('errors.inline.creditcard_number', scope()) };

            handleValidity(isValid, errorObj);
        };

        const checkCardOwnerDocument = () => {
            const document = vm.creditCardFields.cardOwnerDocument(),
                striped = String(document).replace(/[\.|\-|\/]*/g, '');
            let isValid = false,
                errorMessage = '';

            if (document.length > 14) {
                isValid = h.validateCnpj(document);
                errorMessage = 'CNPJ inválido.';
            } else {
                isValid = h.validateCpf(striped);
                errorMessage = 'CPF inválido.';
            }

            handleValidity(isValid, { field: 'cardOwnerDocument', message: errorMessage });
        };

        const checkCreditCardName = () => {
            const trimmedString = vm.creditCardFields.name().replace(/ /g, '');
            const charsOnly = /^[a-zA-Z]*$/;
            const errorObj = { field: 'name', message: I18n.t('errors.inline.creditcard_name', scope()) };
            const isValid = !(_.isEmpty(trimmedString) || !charsOnly.test(trimmedString));

            handleValidity(isValid, errorObj);
        };

        const applyCreditCardNameMask = _.compose(vm.creditCardFields.name, h.noNumbersMask);

        const applyCvvMask = (value) => {
            const setValue = h.numbersOnlyMask(value.substr(0, 4));

            return vm.creditCardFields.cvv(setValue);
        };

        const applyDocumentMask = (value) => {
            if (value.length > 14) {
                vm.creditCardFields.cardOwnerDocument(documentCompanyMask(value));
            } else {
                vm.creditCardFields.cardOwnerDocument(documentMask(value));
            }
        };


        const fieldHasError = (fieldName) => {
            const fieldWithError = _.findWhere(vm.creditCardFields.errors(), { field: fieldName });

            return fieldWithError ? m.component(inlineError, { message: fieldWithError.message }) : '';
        };

        const buildTooltip = tooltipText => m.component(tooltip, {
            el: '.tooltip-wrapper.fa.fa-question-circle.fontcolor-secondary',
            text: tooltipText,
            width: 380
        });

        const isCreditCardSelected = (card, idx) => selectedCreditCard() === card;

        const loadPagarme = (el, isInit) => {
            if (!isInit) {
                const script = document.createElement('script');
                script.src = '//assets.pagar.me/js/pagarme.min.js';
                document.body.appendChild(script);
                script.onload = () => {
                    vm.pagarme(window.PagarMe);
                };
            }
        };

        const selectCreditCard = (card) => {
            selectedCreditCard(card);

            if (card.id === -1) {
                showForm(true);
            } else {
                showForm(false);
            }
        };

        const scope = attr => vm.isInternational()
                   ? I18nIntScope(attr)
                   : I18nScope(attr);

        // Sum the total amount of installments with taxes and returns a formated string
        const sumTotalAmountOfInstallments = (installments, selectedIndex) => {
            const installment = installments[selectedIndex];
            const intResult = (installment.number * Math.round(installment.amount * 100));
            const textResult = (`${intResult}`);
            return textResult.slice(0, -2) + '.' + textResult.slice(-2);;
        }

        if (!args.isSubscription) {
            vm.getInstallments(args.contribution_id)
                .then(() => {
                    loadingInstallments(false);
                    m.redraw();
                });
        }

        if (!args.hideSave) {
            vm.getSavedCreditCards(args.user_id)
                .then((savedCards) => {
                    loadingSavedCreditCards(false);
                    selectCreditCard(savedCards[0]);
                    m.redraw();
                });
        } else {
            showForm(true);
        }

        return {
            vm,
            onSubmit,
            fieldHasError,
            buildTooltip,
            loadingInstallments,
            loadingSavedCreditCards,
            installments: vm.installments,
            selectedInstallment,
            savedCreditCards: vm.savedCreditCards,
            creditCard: vm.creditCardFields,
            creditCardType,
            checkCreditCard,
            checkCreditCardName,
            applyCreditCardNameMask,
            applyCreditCardMask: vm.applyCreditCardMask,
            applyDocumentMask,
            checkCardOwnerDocument,
            applyCvvMask,
            checkcvv,
            selectCreditCard,
            isCreditCardSelected,
            expMonths: vm.expMonthOptions(),
            expYears: vm.expYearOptions(),
            loadPagarme,
            scope,
            sumTotalAmountOfInstallments,
            showForm,
            showSubscriptionModal,
            sendSubscriptionPayment,
            subscriptionEditConfirmed,
            isSubscriptionEdit
        };
    },
    view(ctrl, args) {
        const isInternational = ctrl.vm.isInternational();

        return m('.w-form.u-marginbottom-40', {
            config: ctrl.loadPagarme
        }, [
            m('form[name="email-form"]', {
                onsubmit: ctrl.onSubmit
            }, [
                (!args.hideSave && !ctrl.loadingSavedCreditCards() && (ctrl.savedCreditCards().length > 1)) ? 
                
                    m('.my-credit-cards.w-form.back-payment-form-creditcard.records-choice.u-marginbottom-40',
                        _.map(ctrl.savedCreditCards(), (card, idx) => m(`div#credit-card-record-${idx}.creditcard-records`, {
                            style: 'cursor:pointer;',
                            onclick: () => ctrl.selectCreditCard(card)
                        }, [
                            m('.w-row', [
                                m('.w-col.w-col-1',
                                    m('.back-payment-credit-card-radio-field.w-clearfix.w-radio', [
                                        m('input', {
                                            checked: ctrl.isCreditCardSelected(card, idx),
                                            name: 'payment_subscription_card',
                                            type: 'radio',
                                            value: card.card_key
                                        })
                                    ])
                                ),
                                card.id === -1 ? 
                                m('.w-col.w-col-11',
                                    m('.fontsize-small.fontweight-semibold.fontcolor-secondary', I18n.t('credit_card.use_another', ctrl.scope()))
                                ) : [
                                    m('.w-col.w-col-2',
                                        m('.fontsize-small.fontweight-semibold.text-success', card.card_brand.toUpperCase())
                                    ),
                                    m('.w-col.w-col-5', 
                                        m('.fontsize-small.fontweight-semibold.u-marginbottom-20', `XXXX.XXXX.XXXX.${card.last_digits}`)
                                    ),
                                    m('.w-clearfix.w-col.w-col-4', [
                                        (ctrl.loadingInstallments() || (ctrl.installments().length <= 1)) ? '' :
                                            m('select.w-select.text-field.text-field-creditcard', {
                                                onchange: m.withAttr('value', ctrl.selectedInstallment),
                                                value: ctrl.selectedInstallment()
                                            }, _.map(ctrl.installments(), installment => m('option', { value: installment.number },
                                                `${installment.number} X R$ ${installment.amount}`
                                            ))
                                        ),
                                        (
						ctrl.selectedInstallment() > 1 ?
                                            	m('.fontsize-smaller.fontweight-semibold.fontcolor-secondary', [
                                                	I18n.t('credit_card.total', ctrl.scope()) , `R$ ${ctrl.sumTotalAmountOfInstallments(ctrl.installments(), ctrl.selectedInstallment() - 1)}`,
                                                	m('span.fontcolor-terciary', I18n.t(`credit_card.installments_number.${ctrl.selectedInstallment()}`, ctrl.scope())),
                                                	m('span.fontsize-smallest.fontcolor-terciary')
                                            	])
                                        	: ''
					)
                                    ])
                                ]
                            ])
                        ])
                    )
                )
                : !args.hideSave && ctrl.loadingSavedCreditCards() ? m('.fontsize-small.u-marginbottom-40', I18n.t('credit_card.loading', ctrl.scope())) : '',
                !ctrl.showForm() ? '' : m('#credit-card-payment-form.u-marginbottom-40', [
                    m('div#credit-card-name', [
                        m('.w-row', [
                            m((isInternational ? '.w-col.w-col-12' : '.w-col.w-col-6.w-col-tiny-6.w-sub-col-middle'), [
                                m('label.field-label.fontweight-semibold[for="credit-card-name"]',
                                  I18n.t('credit_card.name', ctrl.scope())
                                 ),
                                m('.fontsize-smallest.fontcolor-terciary.u-marginbottom-10.field-label-tip.u-marginbottom-10',
                                  I18n.t('credit_card.name_tip', ctrl.scope())
                                 ),
                                m('input.w-input.text-field[name="credit-card-name"][type="text"]', {
                                    onfocus: ctrl.vm.resetCreditCardFieldError('name'),
                                    class: ctrl.fieldHasError('name') ? 'error' : '',
                                    onblur: ctrl.checkCreditCardName,
                                    onkeyup: m.withAttr('value', ctrl.applyCreditCardNameMask),
                                    value: ctrl.creditCard.name()
                                }),
                                ctrl.fieldHasError('name')
                            ]),
                            (!isInternational ?
                             m('.w-col.w-col-6.w-col-tiny-6.w-sub-col-middle', [
                                 m('label.field-label.fontweight-semibold[for="credit-card-document"]',
                                   I18n.t('credit_card.document', ctrl.scope())
                                  ),
                                 m('.fontsize-smallest.fontcolor-terciary.u-marginbottom-10.field-label-tip.u-marginbottom-10',
                                   I18n.t('credit_card.document_tip', ctrl.scope())
                                  ),
                                 m('input.w-input.text-field[name="credit-card-document"]', {
                                     onfocus: ctrl.vm.resetCreditCardFieldError('cardOwnerDocument'),
                                     class: ctrl.fieldHasError('cardOwnerDocument') ? 'error' : '',
                                     onblur: ctrl.checkCardOwnerDocument,
                                     onkeyup: m.withAttr('value', ctrl.applyDocumentMask),
                                     value: ctrl.creditCard.cardOwnerDocument()
                                 }),
                                 ctrl.fieldHasError('cardOwnerDocument')
                             ]) : '')
                        ]),
                    ]),
                    m('div#credit-card-number', [
                        m('label.field-label.fontweight-semibold[for="credit-card-number"]',
                            I18n.t('credit_card.number', ctrl.scope())
                        ),
                        m('.fontsize-smallest.fontcolor-terciary.u-marginbottom-10.field-label-tip.u-marginbottom-10',
                            I18n.t('credit_card.number_tip', ctrl.scope())
                        ),
                        m.component(creditCardInput, {
                            onfocus: ctrl.vm.resetCreditCardFieldError('number'),
                            onblur: ctrl.checkCreditCard,
                            class: ctrl.fieldHasError('number') ? 'error' : '',
                            value: ctrl.creditCard.number,
                            name: 'credit-card-number',
                            type: ctrl.creditCardType
                        }),
                        ctrl.fieldHasError('number')
                    ]),
                    m('div#credit-card-date', [
                        m('label.field-label.fontweight-semibold[for="expiration-date"]', [
                            I18n.t('credit_card.expiry', ctrl.scope())
                        ]),
                        m('.fontsize-smallest.fontcolor-terciary.u-marginbottom-10.field-label-tip.u-marginbottom-10',
                            I18n.t('credit_card.expiry_tip', ctrl.scope())
                        ),
                        m('.w-row', [
                            m('.w-col.w-col-6.w-col-tiny-6.w-sub-col-middle',
                                m('select.w-select.text-field[name="expiration-date_month"]', {
                                    onfocus: ctrl.vm.resetCreditCardFieldError('expiry'),
                                    class: ctrl.fieldHasError('expiry') ? 'error' : '',
                                    onchange: m.withAttr('value', ctrl.creditCard.expMonth),
                                    value: ctrl.creditCard.expMonth()
                                }, _.map(ctrl.expMonths, month => m('option', { value: month[0] }, month[1])))
                            ),
                            m('.w-col.w-col-6.w-col-tiny-6',
                                m('select.w-select.text-field[name="expiration-date_year"]', {
                                    onfocus: ctrl.vm.resetCreditCardFieldError('expiry'),
                                    class: ctrl.fieldHasError('expiry') ? 'error' : '',
                                    onchange: m.withAttr('value', ctrl.creditCard.expYear),
                                    onblur: ctrl.checkExpiry,
                                    value: ctrl.creditCard.expYear()
                                }, _.map(ctrl.expYears, year => m('option', { value: year }, year)))
                            ),
                            m('.w-col.w-col-12', ctrl.fieldHasError('expiry'))
                        ])
                    ]),
                    m('div#credit-card-cvv', [
                        m('label.field-label.fontweight-semibold[for="credit-card-cvv"]', [
                            I18n.t('credit_card.cvv', ctrl.scope()),
                            ctrl.buildTooltip(I18n.t('credit_card.cvv_tooltip', ctrl.scope()))
                        ]),
                        m('.fontsize-smallest.fontcolor-terciary.u-marginbottom-10.field-label-tip.u-marginbottom-10',
                            I18n.t('credit_card.cvv_tip', ctrl.scope())
                        ),
                        m('.w-row', [
                            m('.w-col.w-col-8.w-col-tiny-6.w-sub-col-middle',
                                m('input.w-input.text-field[name="credit-card-cvv"][type="tel"]', {
                                    onfocus: ctrl.vm.resetCreditCardFieldError('cvv'),
                                    class: ctrl.fieldHasError('cvv') ? 'error' : '',
                                    onkeyup: m.withAttr('value', ctrl.applyCvvMask),
                                    onblur: ctrl.checkcvv,
                                    value: ctrl.creditCard.cvv()
                                }),
                                ctrl.fieldHasError('cvv')
                            ),
                            m('.w-col.w-col-4.w-col-tiny-6.u-text-center',
                                m('img[src="https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/57298c1c7e99926e77127bdd_cvv-card.jpg"][width="176"]')
                            )
                        ])
                    ]),
                    projectVM.isSubscription() || (ctrl.loadingInstallments() || (ctrl.installments().length <= 1)) ? '' : m('.w-row', [
                        m('.w-clearfix.w-col.w-col-6', [
                            m('label.field-label.fontweight-semibold[for="split"]',
                                I18n.t('credit_card.installments', ctrl.scope())
                            ),
                            m('select.text-field.text-field-creditcard.w-select[name="split"]', {
                                onchange: m.withAttr('value', ctrl.selectedInstallment),
                                value: ctrl.selectedInstallment()
                            }, _.map(ctrl.installments(), installment => m(`option[value="${installment.number}"]`,
                                     `${installment.number} X R$ ${installment.amount}`
                            ))),
			    (

	                            ctrl.selectedInstallment() > 1 ?
        	                        m('.fontsize-smaller.fontweight-semibold.fontcolor-secondary', [
                	                    I18n.t('credit_card.total', ctrl.scope()), `R$ ${ctrl.sumTotalAmountOfInstallments(ctrl.installments(), ctrl.selectedInstallment() - 1)}`,
                        	            m('span.fontcolor-terciary', I18n.t(`credit_card.installments_number.${ctrl.selectedInstallment()}`, ctrl.scope())),
                                	    m('span.fontsize-smallest.fontcolor-terciary')
                                	])
                            	    : ''
			    )
                        ]),
                        m('.w-col.w-col-6')
                    ]),
                    args.hideSave ? '' : m(".card.card-terciary.u-radius.u-margintop-30", 
                        m(".fontsize-small.w-clearfix.w-checkbox", [
                            m('input#payment_save_card.w-checkbox-input[type="checkbox"][name="payment_save_card"]', {
                                onchange: m.withAttr('checked', ctrl.creditCard.save),
                                checked: ctrl.creditCard.save()
                            }),
                            m('label.w-form-label[for="payment_save_card"]', 
                                I18n.t('credit_card.save_card', ctrl.scope())
                            )
                        ])
                    )
                ]),
                m('.w-row', [
                    m('.w-col.w-col-8.w-col-push-2', [
                        !_.isEmpty(ctrl.vm.submissionError()) ? m('.card.card-error.u-radius.zindex-10.u-marginbottom-30.fontsize-smaller',
                            m('.u-marginbottom-10.fontweight-bold', m.trust(ctrl.vm.submissionError()))) : '',
                        ctrl.vm.isLoading() ? h.loader() : m('input.btn.btn-large.u-marginbottom-20[type="submit"]', { value:
                        ctrl.isSubscriptionEdit() && !args.isReactivation()
                                ? I18n.t('subscription_edit', ctrl.scope())
                                : I18n.t('credit_card.finish_payment', ctrl.scope())
                        }),
                        m('.fontsize-smallest.u-text-center.u-marginbottom-30',
                            m.trust(
                                I18n.t('credit_card.terms_of_use_agreement', ctrl.scope())
                            )
                        )
                    ])
                ]),
                ctrl.showSubscriptionModal() 
                    ? m(subscriptionEditModal,
                        {
                            args,
                            vm: ctrl.vm,
                            showModal: ctrl.showSubscriptionModal,
                            confirm: ctrl.subscriptionEditConfirmed,
                            paymentMethod: 'credit_card',
                            pay: ctrl.onSubmit
                        }
                    ) : null
            ])
        ]);
    }
};

export default paymentCreditCard;
