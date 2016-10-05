import m from 'mithril';
import _ from 'underscore';
import h from '../h';
import tooltip from './tooltip';
import creditCardVM from '../vms/credit-card-vm';
import creditCardInput from './credit-card-input';
import inlineError from './inline-error';

const I18nScope = _.partial(h.i18nScope, 'projects.contributions.edit.errors');

const paymentCreditCard = {
    controller (args) {
        const vm = args.vm,
            loadingInstallments = m.prop(true),
            loadingSavedCreditCards = m.prop(true),
            selectedCreditCard = m.prop({id: -1}),
            selectedInstallment = m.prop('1'),
            showForm = m.prop(false),
            creditCardType = m.prop('unkown'),
            errors = m.prop([]);

        const onSubmit = () => {
            if (selectedCreditCard().id === -1) {
                checkcvv();
                checkExpiry();
                checkCreditCard();
                checkCreditCardName();
            } else {
                vm.creditCardFields.errors([]);
            }

            if (vm.creditCardFields.errors().length === 0) {
                vm.sendPayment(selectedCreditCard, selectedInstallment, args.contribution_id, args.project_id);
            }

            return false;
        };

        const handleValidity = (isValid, errorObj) => {
            if (!isValid) {
                vm.creditCardFields.errors().push(errorObj);
            } else {
                const errorsWithout = _.reject(vm.creditCardFields.errors(), (err) => _.isEqual(err, errorObj));
                vm.creditCardFields.errors(errorsWithout);
            }
        };

        const checkcvv = () => {
            const isValid = creditCardVM.validateCardcvv(vm.creditCardFields.cvv(), creditCardType()),
                errorObj = {field: 'cvv', message: I18n.t('inline.creditcard_cvv', I18nScope())};

            handleValidity(isValid, errorObj);

            return isValid;
        };

        const checkExpiry = () => {
            const isValid = creditCardVM.validateCardExpiry(vm.creditCardFields.expMonth(), vm.creditCardFields.expYear()),
                errorObj = {field: 'expiry', message: I18n.t('inline.creditcard_expiry', I18nScope())};

            handleValidity(isValid, errorObj);

            return isValid;
        };

        const checkCreditCard = () => {
            const isValid = creditCardVM.validateCardNumber(vm.creditCardFields.number()),
                errorObj = {field: 'number', message: I18n.t('inline.creditcard_number', I18nScope())};

            handleValidity(isValid, errorObj)

            return isValid;
        };

        const checkCreditCardName = () => {
            const trimmedString = vm.creditCardFields.name().replace(/ /g,'');
            const charsOnly = /^[a-zA-Z]*$/;
            const errorObj = {field: 'name', message: I18n.t('inline.creditcard_name', I18nScope())};
            const isValid = !(_.isEmpty(trimmedString) || !charsOnly.test(trimmedString));

            handleValidity(isValid, errorObj);

            return isValid;
        };

        const fieldHasError = (fieldName) => {
            const fieldWithError = _.findWhere(vm.creditCardFields.errors(), {field: fieldName});

            return fieldWithError ? m.component(inlineError, {message: fieldWithError.message}) : '';
        };


        const buildTooltip = (tooltipText) => {
            return m.component(tooltip, {
                el: '.tooltip-wrapper.fa.fa-question-circle.fontcolor-secondary',
                text: tooltipText,
                width: 380
            });
        };

        const isCreditCardSelected = (card, idx) => {
            return selectedCreditCard() === card;
        };

        const loadPagarme = (el, isInit) => {
            if (!isInit) {
                const script = document.createElement('script');
                script.src = '//assets.pagar.me/js/pagarme.min.js';
                document.body.appendChild(script);
                script.onload = () => {
                    vm.pagarme(window.PagarMe);
                }
            }
        }

        const selectCreditCard = (card) => {
            selectedCreditCard(card);

            if (card.id === -1) {
                showForm(true);
            } else {
                showForm(false);
            }
        };

        vm.getInstallments(args.contribution_id)
            .then(() => {
                loadingInstallments(false);
                m.redraw();
            });

        vm.getSavedCreditCards(args.user_id)
            .then((savedCards) => {
                loadingSavedCreditCards(false);
                selectCreditCard(savedCards[0]);
                m.redraw();
            });

        return {
            vm: vm,
            onSubmit: onSubmit,
            fieldHasError: fieldHasError,
            buildTooltip: buildTooltip,
            loadingInstallments: loadingInstallments,
            loadingSavedCreditCards: loadingSavedCreditCards,
            installments: vm.installments,
            selectedInstallment: selectedInstallment,
            savedCreditCards: vm.savedCreditCards,
            creditCard: vm.creditCardFields,
            creditCardType: creditCardType,
            applyCreditCardMask: vm.applyCreditCardMask,
            selectCreditCard: selectCreditCard,
            isCreditCardSelected: isCreditCardSelected,
            expMonths: vm.expMonthOptions(),
            expYears: vm.expYearOptions(),
            loadPagarme: loadPagarme,
            showForm: showForm
        };
    },
    view (ctrl, args) {
        return m('.w-form.u-marginbottom-40', {
            config: ctrl.loadPagarme
        },[
            m('form[name="email-form"]', {
                onsubmit: ctrl.onSubmit
            },[
                (!ctrl.loadingSavedCreditCards() || (ctrl.savedCreditCards().length > 0)) ? m('.my-credit-cards.w-form.back-payment-form-creditcard.records-choice.u-marginbottom-40',
                    _.map(ctrl.savedCreditCards(), (card, idx) => {
                        return m(`div#credit-card-record-${idx}.w-row.creditcard-records`, {
                                style: 'cursor:pointer;',
                                onclick: () => ctrl.selectCreditCard(card)
                            },[
                                m('.w-col.w-col-1.w-sub-col',
                                    m('.w-radio.w-clearfix.back-payment-credit-card-radio-field',
                                        m('input', {
                                            checked: ctrl.isCreditCardSelected(card, idx),
                                            name: 'payment_subscription_card',
                                            type: 'radio',
                                            value: card.card_key
                                        })
                                    )
                                ),
                                card.id === -1 ? m('.w-col.w-col-11',
                                        m('.fontsize-small.fontweight-semibold.fontcolor-secondary', 'Usar outro cartão de crédito.')
                                    ) : [
                                        m('.w-col.w-col-2.w-sub-col.w-sub-col-middle',
                                            m('.fontsize-small.fontweight-semibold.text-success', card.card_brand.toUpperCase())
                                        ),
                                        m('.w-col.w-col-5.w-sub-col.w-sub-col-middle',
                                            m('.fontsize-small.fontweight-semibold.u-marginbottom-20', `XXXX.XXXX.XXXX.${card.last_digits}`)
                                        ),
                                        m('.w-col.w-col-4',
                                            (ctrl.loadingInstallments() || (ctrl.installments().length <= 1)) ? '' :
                                                m('select.w-select.text-field.text-field-creditcard',{
                                                    onchange: m.withAttr('value', ctrl.selectedInstallment),
                                                    value: ctrl.selectedInstallment()
                                                } ,_.map(ctrl.installments(), (installment) => {
                                                        return m(`option[value="${installment.number}"]`,
                                                            `${installment.number} X R$ ${installment.amount}`
                                                        );
                                                    })
                                                )
                                        )
                                    ]
                            ]);
                    })
                ) : ctrl.loadingSavedCreditCards() ? m('.fontsize-small.u-marginbottom-40', 'Carregando informações de cartão...') : '',
                !ctrl.showForm() ? '' : m('#credit-card-payment-form.u-marginbottom-40', [
                    m('div#credit-card-name', [
                        m('label.field-label.fontweight-semibold[for="credit-card-name"]',
                            'Nome no cartão de crédito *'
                        ),
                        m('.fontsize-smallest.fontcolor-terciary.u-marginbottom-10.field-label-tip.u-marginbottom-10',
                            'Nome impresso na frente do seu cartão de crédito'
                        ),
                        m('input.w-input.text-field[name="credit-card-name"][required="required"][type="text"]', {
                            onfocus: ctrl.vm.resetCreditCardFieldError('name'),
                            class: ctrl.fieldHasError('name') ? 'error' : '',
                            onchange: m.withAttr('value', ctrl.creditCard.name),
                            value: ctrl.creditCard.name()
                        }),
                        ctrl.fieldHasError('name')
                    ]),
                    m('div#credit-card-number', [
                        m('label.field-label.fontweight-semibold[for="credit-card-number"]',
                            'Número do cartão de crédito *'
                        ),
                        m('.fontsize-smallest.fontcolor-terciary.u-marginbottom-10.field-label-tip.u-marginbottom-10',
                            'O número normalmente com 16 dígitos na frente do seu cartão de crédito'
                        ),
                        m.component(creditCardInput, {
                            onfocus: ctrl.vm.resetCreditCardFieldError('number'),
                            class: ctrl.fieldHasError('number') ? 'error' : '',
                            value: ctrl.creditCard.number,
                            name: 'credit-card-number',
                            type: ctrl.creditCardType
                        }),
                        ctrl.fieldHasError('number')
                    ]),
                    m('div#credit-card-date', [
                        m('label.field-label.fontweight-semibold[for="expiration-date"]', [
                            'Expiração (mm/aaaa)* '
                        ]),
                        m('.fontsize-smallest.fontcolor-terciary.u-marginbottom-10.field-label-tip.u-marginbottom-10',
                            'A data de validade, geralmente na frente do cartão'
                        ),
                        m('.w-row', [
                            m('.w-col.w-col-6.w-col-tiny-6.w-sub-col',
                                m('select.w-select.text-field[name="expiration-date_month"]', {
                                    onfocus: ctrl.vm.resetCreditCardFieldError('expiry'),
                                    class: ctrl.fieldHasError('expiry') ? 'error' : '',
                                    onchange: m.withAttr('value', ctrl.creditCard.expMonth),
                                    value: ctrl.creditCard.expMonth()
                                }, _.map(ctrl.expMonths, month => m('option', {value: month[0]}, month[1])))
                            ),
                            m('.w-col.w-col-6.w-col-tiny-6',
                                m('select.w-select.text-field[name="expiration-date_year"]', {
                                    onfocus: ctrl.vm.resetCreditCardFieldError('expiry'),
                                    class: ctrl.fieldHasError('expiry') ? 'error' : '',
                                    onchange: m.withAttr('value', ctrl.creditCard.expYear),
                                    value: ctrl.creditCard.expYear()
                                }, _.map(ctrl.expYears, year => m('option', {value: year}, year)))
                            ),
                            m('.w-col.w-col-12', ctrl.fieldHasError('expiry'))
                        ])
                    ]),
                    m('div#credit-card-cvv', [
                        m('label.field-label.fontweight-semibold[for="credit-card-cvv"]',[
                            'Código de Segurança (CVV / CVV2)* ',
                            ctrl.buildTooltip('Os 3 ou 4 dígitos que estão nas costas dos cartões VISA, MASTER, DINERS, ELO e na frente do cartão AMEX.')
                        ]),
                        m('.fontsize-smallest.fontcolor-terciary.u-marginbottom-10.field-label-tip.u-marginbottom-10',
                            'Os 3 dígitos (quando na frente) ou 4 dígitos (quando atrás) do seu cartão'
                        ),
                        m('.w-row', [
                            m('.w-col.w-col-8.w-col-tiny-6',
                                m('input.w-input.text-field[name="credit-card-cvv"][required="required"][type="phone"]', {
                                    onfocus: ctrl.vm.resetCreditCardFieldError('cvv'),
                                    class: ctrl.fieldHasError('cvv') ? 'error' : '',
                                    onchange: m.withAttr('value', ctrl.creditCard.cvv),
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
                    m('.w-checkbox.w-clearfix', [
                        m('input#payment_save_card.w-checkbox-input[type="checkbox"][name="payment_save_card"]', {
                            onchange: m.withAttr('checked', ctrl.creditCard.save),
                            checked: ctrl.creditCard.save()
                        }),
                        m('label.w-form-label[for="payment_save_card"]', 'Quero salvar meu cartão de crédito para facilitar apoios futuros.')
                    ])
                ]),
                m('.w-row', [
                    m('.w-col.w-col-8.w-col-push-2', [
                        !_.isEmpty(ctrl.vm.submissionError()) ? m('.card.card-error.u-radius.zindex-10.u-marginbottom-30.fontsize-smaller',
                            m(".u-marginbottom-10.fontweight-bold", m.trust(ctrl.vm.submissionError()))) : '',
                        ctrl.vm.isLoading() ? h.loader() : m('input.btn.btn-large.u-marginbottom-20[type="submit"]',{ value: 'Finalizar pagamento' }, ''),
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
