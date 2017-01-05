import m from 'mithril';
import models from '../models';
import postgrest from 'mithril-postgrest';
import _ from 'underscore';
import h from '../h';
import userVM from '../vms/user-vm';
import inlineError from './inline-error';
import popNotification from './pop-notification';

const userBilling = {
    controller(args) {
        models.bank.pageSize(false);
        let deleteFormSubmit;
        const user = args.user,
            bankAccount = m.prop({}),
            fields = {
                owner_name: m.prop(''),
                agency: m.prop(''),
                bank_id: m.prop(''),
                agency_digit: m.prop(''),
                account: m.prop(''),
                account_digit: m.prop(''),
                owner_document: m.prop(''),
                bank_account_id: m.prop('')
            },
            userId = args.userId,
            error = m.prop(''),
            showError = m.prop(false),
            loader = m.prop(true),
            bankInput = m.prop(''),
            bankCode = m.prop('-1'),
            banks = m.prop(),
            creditCards = m.prop(),
            handleError = () => {
                error(true);
                loader(false);
                m.redraw();
            },
            banksLoader = postgrest.loader(models.bank.getPageOptions()),
            showSuccess = m.prop(false),
            showOtherBanks = h.toggleProp(false, true),
            showOtherBanksInput = m.prop(false),
            setCsrfToken = (xhr) => {
                if (h.authenticityToken()) {
                    xhr.setRequestHeader('X-CSRF-Token', h.authenticityToken());
                }
                return;
            },
            confirmDelete = (cardId) => {
              let r = confirm('você tem certeza?');
              if(r){
                return m.request({
                    method: 'DELETE',
                    url: `/users/${user.id}/credit_cards/${cardId}`,
                    config: setCsrfToken
                }).then(() => {
                  location.reload();
                }).catch(handleError);
              }
              return false;
            },
            popularBanks = [{
                id: '51',
                code: '001',
                name: 'Banco do Brasil S.A.'
            }, {
                id: '131',
                code: '341',
                name: 'Itaú Unibanco S.A.'
            }, {
                id: '122',
                code: '104',
                name: 'Caixa Econômica Federal'
            }, {
                id: '104',
                code: '033',
                name: 'Banco Santander  (Brasil)  S.A.'
            }, {
                id: '127',
                code: '399',
                name: 'HSBC Bank Brasil S.A. - Banco Múltiplo'
            }, {
                id: '23',
                code: '237',
                name: 'Banco Bradesco S.A.'
            }],
            // Little trick to reproduce Rails+SimpleForm behavior
            // We create a hidden form with the correct input values set
            // Then we submit it when the remove card button is clicked
            // The card id is set on the go, with the help of a closure.
            toDeleteCard = m.prop(-1),
            deleteCard = (id) => () => {
                toDeleteCard(id);
                // We must redraw here to update the action output of the hidden form on the DOM.
                m.redraw(true);
                deleteFormSubmit();
                return false;
            },
            updateUserData = (user_id) => {
                let userData = {
                    owner_name: fields.owner_name(),
                    owner_document: fields.owner_document(),
                    bank_id: bankCode(),
                    input_bank_number: bankInput(),
                    agency_digit: fields.agency_digit(),
                    agency: fields.agency(),
                    account: fields.account(),
                    account_digit: fields.account_digit()
                };
                if((fields.bank_account_id())){
                  userData['id'] = fields.bank_account_id().toString();
                }

                return m.request({
                    method: 'PUT',
                    url: `/users/${user_id}.json`,
                    data: {
                      user: {bank_account_attributes: userData}
                    },
                    config: setCsrfToken
                }).then(() => {
                    showSuccess(true);
                    m.redraw();
                }).catch((err) => {
                    if (_.isArray(err.errors)) {
                        error(err.errors.join('<br>'));
                    } else {
                        error('Erro ao atualizar informações.');
                    }

                    showError(true);
                    m.redraw();
                });
            },
            onSubmit = () => {
                updateUserData(userId);

                return false;
            },
            setCardDeletionForm = (el, isInit) => {
                if (!isInit) {
                    deleteFormSubmit = () => el.submit();
                }
            };

        userVM.getUserBankAccount(userId).then(data => {
            if(!_.isEmpty(_.first(data))){
              bankAccount(_.first(data));
              fields.owner_document(bankAccount().owner_document);
              fields.owner_name(bankAccount().owner_name);
              fields.bank_account_id(bankAccount().bank_account_id);
              fields.account(bankAccount().account);
              fields.account_digit(bankAccount().account_digit);
              fields.agency(bankAccount().agency);
              fields.agency_digit(bankAccount().agency_digit);
              fields.bank_id(bankAccount().bank_id);
              bankCode(bankAccount().bank_id);
            }
        }).catch(handleError);

        userVM.getUserCreditCards(userId).then(creditCards).catch(handleError);
        banksLoader.load().then(banks).catch(handleError);

        return {
            creditCards: creditCards,
            deleteCard: deleteCard,
            toDeleteCard: toDeleteCard,
            setCardDeletionForm: setCardDeletionForm,
            bankAccount: bankAccount,
            confirmDelete: confirmDelete,
            bankInput: bankInput,
            banks: banks,
            showError: showError,
            showOtherBanks: showOtherBanks,
            fields: fields,
            showOtherBanksInput: showOtherBanksInput,
            loader: loader,
            bankCode: bankCode,
            onSubmit: onSubmit,
            showSuccess: showSuccess,
            popularBanks: popularBanks,
            user: user,
            error: error
        };
    },
    view(ctrl, args) {
        let user = args.user,
            fields = ctrl.fields,
            bankAccount = ctrl.bankAccount();

        return m('[id=\'billing-tab\']', [
            (ctrl.showSuccess() ? m.component(popNotification, {
                message: 'As suas informações foram atualizadas'
            }) : ''),
            (ctrl.showError() ? m.component(popNotification, {
                message: m.trust(ctrl.error()),
                error: true
            }) : ''),
            m('.w-row',
                m('.w-col.w-col-10.w-col-push-1', [
                    m('.w-form.card.card-terciary.u-marginbottom-20', [
                        m('.fontsize-base.fontweight-semibold',
                            'Cartões de crédito'
                        ),
                        m('.fontsize-small.u-marginbottom-20', [
                            'Caso algum projeto que você tenha apoiado ',
                            m('b',
                                'com Cartão de Crédito'
                            ),
                            ' não seja bem-sucedido, nós efetuaremos o reembolso ',
                            m('b',
                                'automaticamente'
                            ),
                            ' no cartão utilizado para efetuar o apoio. '
                        ]),
                        m('.divider.u-marginbottom-20'),
                        m('.w-row.w-hidden-tiny.card', [
                            m('.w-col.w-col-5.w-col-small-5',
                                m('.fontsize-small.fontweight-semibold',
                                    'Cartão'
                                )
                            ),
                            m('.w-col.w-col-5.w-col-small-5',
                                m('.fontweight-semibold.fontsize-small',
                                    'Operadora'
                                )
                            ),
                            m('.w-col.w-col-2.w-col-small-2')
                        ]),

                        (_.map(ctrl.creditCards(), (card) => {
                            return m('.w-row.card', [
                                m('.w-col.w-col-5.w-col-small-5',
                                    m('.fontsize-small.fontweight-semibold', [
                                        'XXXX XXXX XXXX',
                                        m.trust('&nbsp;'),
                                        card.last_digits
                                    ])
                                ),
                                m('.w-col.w-col-5.w-col-small-5',
                                    m('.fontsize-small.fontweight-semibold.u-marginbottom-10',
                                        card.card_brand.toUpperCase()
                                    )
                                ),
                                m('.w-col.w-col-2.w-col-small-2',
                                    m(`a.btn.btn-terciary.btn-small[rel=\'nofollow\']`,
                                        {onclick: ctrl.deleteCard(card.id)},
                                        'Remover'
                                    )
                                )
                            ]);
                        })),
                        m('form.w-hidden', {action: `/pt/users/${user.id}/credit_cards/${ctrl.toDeleteCard()}`, method: 'POST', config: ctrl.setCardDeletionForm}, [
                            m('input[name=\'utf8\'][type=\'hidden\'][value=\'✓\']'),
                            m('input[name=\'_method\'][type=\'hidden\'][value=\'delete\']'),
                            m(`input[name='authenticity_token'][type='hidden'][value='${h.authenticityToken()}']`),
                        ])
                    ]),
                    m(`form.simple_form.refund_bank_account_form`, {onsubmit: ctrl.onSubmit}, [
                        m('input[id=\'anchor\'][name=\'anchor\'][type=\'hidden\'][value=\'billing\']'),
                        m('.w-form.card.card-terciary', [
                            m('.fontsize-base.fontweight-semibold',
                                'Dados bancários'
                            ),
                            m('.fontsize-small.u-marginbottom-20', [
                                'Caso algum projeto que você tenha apoiado ',
                                m('b',
                                    'com Boleto Bancário'
                                ),
                                ' não seja bem-sucedido, nós efetuaremos o reembolso de seu pagamento ',
                                m('b',
                                    'automaticamente'
                                ),
                                ' na conta indicada abaixo.'
                            ]),
                            m('.divider.u-marginbottom-20'),
                            m('.w-row', [
                                m('.w-col.w-col-6.w-sub-col', [
                                    m('label.text.required.field-label.field-label.fontweight-semibold.force-text-dark[for=\'user_bank_account_attributes_owner_name\']',
                                        'Nome do titular'
                                    ),
                                    m(`input.string.required.w-input.text-field.positive[id='user_bank_account_attributes_owner_name'][type='text']`, {
                                        value: fields.owner_name(),
                                        name: 'user[bank_account_attributes][owner_name]',
                                        onchange: m.withAttr('value', fields.owner_name)
                                    })
                                ]),
                                m('.w-col.w-col-6', [
                                    m('label.text.required.field-label.field-label.fontweight-semibold.force-text-dark[for=\'user_bank_account_attributes_owner_document\']',
                                        'CPF / CNPJ do titular'
                                    ),
                                    m('input.string.tel.required.w-input.text-field.positive[data-validate-cpf-cnpj=\'true\'][id=\'user_bank_account_attributes_owner_document\'][type=\'tel\'][validation_text=\'true\']', {
                                        value: fields.owner_document(),
                                        name: 'user[bank_account_attributes][owner_document]',
                                        onchange: m.withAttr('value', fields.owner_document)
                                    })
                                ])
                            ]),
                            m('.w-row', [
                                m(`.w-col.w-col-6.w-sub-col${ctrl.showOtherBanksInput() ? '.w-hidden' : ''}[id='bank_select']`,
                                    m('.input.select.required.user_bank_account_bank_id', [
                                        m('label.field-label',
                                            'Banco'
                                        ),
                                        m('select.select.required.w-input.text-field.bank-select.positive[id=\'user_bank_account_attributes_bank_id\']', {
                                            name: 'user[bank_account_attributes][bank_id]',
                                            onchange: (e) => {
                                                m.withAttr('value', ctrl.bankCode)(e);
                                                ctrl.showOtherBanksInput(ctrl.bankCode() == '0');
                                            }
                                        }, [
                                            m('option[value=\'\']', {selected: fields.bank_id() === ''}),
                                            (_.map(ctrl.popularBanks, (bank) => {
                                                return (fields.bank_id() != bank.id ? m(`option[value='${bank.id}']`, {
                                                        selected: fields.bank_id() == bank.id
                                                    },
                                                    `${bank.code} . ${bank.name}`) : '');
                                            })),
                                            (fields.bank_id() === '' || _.find(ctrl.popularBanks, (bank) => {
                                                return bank.id === fields.bank_id();
                                            }) ? '' :
                                                m(`option[value='${fields.bank_id()}']`, {
                                                        selected: true
                                                    },
                                                    `${bankAccount.bank_code} . ${bankAccount.bank_name}`
                                                )
                                            ),
                                            m('option[value=\'0\']',
                                                'Outro'
                                            )
                                        ]),
                                        m('.fontsize-smaller.text-error.u-marginbottom-20.fa.fa-exclamation-triangle.w-hidden[data-error-for=\'user_bank_account_attributes_bank_id\']',
                                            ' Selecione um banco'
                                        )
                                    ])
                                ),
                                (ctrl.showOtherBanksInput() ?
                                    m('.w-col.w-col-6.w-sub-col',
                                        m('.w-row.u-marginbottom-20[id=\'bank_search\']',
                                            m('.w-col.w-col-12', [
                                                m('.input.string.optional.user_bank_account_input_bank_number', [
                                                    m('label.field-label',
                                                        'Número do banco (3 números)'
                                                    ),
                                                    m('input.string.optional.w-input.text-field.bank_account_input_bank_number[id=\'user_bank_account_attributes_input_bank_number\'][maxlength=\'3\'][size=\'3\'][type=\'text\']', {
                                                        name: 'user[bank_account_attributes][input_bank_number]',
                                                        value: ctrl.bankInput(),
                                                        onchange: m.withAttr('value', ctrl.bankInput)
                                                    }),
                                                    m('.fontsize-smaller.text-error.u-marginbottom-20.fa.fa-exclamation-triangle.w-hidden[data-error-for=\'user_bank_account_attributes_input_bank_number\']',

                                                        ' Número do banco inválido'
                                                    )
                                                ]),
                                                m('a.w-hidden-small.w-hidden-tiny.alt-link.fontsize-smaller[href=\'javascript:void(0);\'][id=\'show_bank_list\']', {
                                                    onclick: ctrl.showOtherBanks.toggle
                                                }, [
                                                    'Busca por nome  ',
                                                    m.trust('&nbsp;'),
                                                    m.trust('&gt;')
                                                ]),
                                                m('a.w-hidden-main.w-hidden-medium.alt-link.fontsize-smaller[href=\'javascript:void(0);\'][id=\'show_bank_list\']', {
                                                    onclick: ctrl.showOtherBanks.toggle
                                                }, [
                                                    'Busca por nome  ',
                                                    m.trust('&nbsp;'),
                                                    m.trust('&gt;')
                                                ])
                                            ])
                                        )
                                    ) : ''),
                                (ctrl.showOtherBanks() ?
                                    m('.w-row[id=\'bank_search_list\']',
                                        m('.w-col.w-col-12',
                                            m('.select-bank-list[data-ix=\'height-0-on-load\']', {
                                                    style: {
                                                        'height': '395px'
                                                    }
                                                },
                                                m('.card.card-terciary', [
                                                    m('.fontsize-small.fontweight-semibold.u-marginbottom-10.u-text-center',
                                                        'Selecione o seu banco abaixo'
                                                    ),
                                                    m('.fontsize-smaller', [
                                                        m('.w-row.card.card-secondary.fontweight-semibold', [
                                                            m('.w-col.w-col-3.w-col-small-3.w-col-tiny-3',
                                                                m('div',
                                                                    'Número'
                                                                )
                                                            ),
                                                            m('.w-col.w-col-9.w-col-small-9.w-col-tiny-9',
                                                                m('div',
                                                                    'Nome'
                                                                )
                                                            )
                                                        ]),
                                                        (!_.isEmpty(ctrl.banks()) ?
                                                            _.map(ctrl.banks(), (bank) => {
                                                                return m('.w-row.card.fontsize-smallest', [
                                                                    m('.w-col.w-col-3.w-col-small-3.w-col-tiny-3',
                                                                        m(`a.link-hidden.bank-resource-link[data-code='${bank.code}'][data-id='${bank.id}'][href='javascript:void(0)']`, {
                                                                                onclick: () => {
                                                                                    ctrl.bankInput(bank.code);
                                                                                    ctrl.showOtherBanks.toggle();
                                                                                }
                                                                            },
                                                                            bank.code
                                                                        )
                                                                    ),
                                                                    m('.w-col.w-col-9.w-col-small-9.w-col-tiny-9',
                                                                        m(`a.link-hidden.bank-resource-link[data-code='${bank.code}'][data-id='${bank.id}'][href='javascript:void(0)']`, {
                                                                                onclick: () => {
                                                                                    ctrl.bankInput(bank.code);
                                                                                    ctrl.showOtherBanks.toggle();
                                                                                }
                                                                            },
                                                                            `${bank.code} . ${bank.name}`
                                                                        )
                                                                    )
                                                                ]);
                                                            }) : '')
                                                    ])
                                                ])
                                            )
                                        )
                                    ) : ''),
                                m('.w-col.w-col-6',
                                    m('.w-row', [
                                        m('.w-col.w-col-6.w-col-small-6.w-col-tiny-6.w-sub-col-middle', [
                                            m('label.text.required.field-label.field-label.fontweight-semibold.force-text-dark[for=\'user_bank_account_attributes_agency\']',
                                                'Agência'
                                            ),
                                            m('input.string.required.w-input.text-field.positive[id=\'user_bank_account_attributes_agency\'][type=\'text\']', {
                                                value: fields.agency(),
                                                name: 'user[bank_account_attributes][agency]',
                                                onchange: m.withAttr('value', fields.agency)
                                            })
                                        ]),
                                        m('.w-col.w-col-6.w-col-small-6.w-col-tiny-6', [
                                            m('label.text.optional.field-label.field-label.fontweight-semibold.force-text-dark[for=\'user_bank_account_attributes_agency_digit\']',
                                                'Dígito agência'
                                            ),
                                            m('input.string.optional.w-input.text-field.positive[id=\'user_bank_account_attributes_agency_digit\'][type=\'text\']', {
                                                value: fields.agency_digit(),
                                                name: 'user[bank_account_attributes][agency_digit]',
                                                onchange: m.withAttr('value', fields.agency_digit)
                                            })
                                        ])
                                    ])
                                )
                            ]),
                            m('.w-row', [
                                m('.w-col.w-col-6.w-sub-col', [
                                    m('label.field-label.fontweight-semibold',
                                        'Tipo de conta'
                                    ),
                                    m('p.fontsize-smaller.u-marginbottom-20',
                                        'Só aceitamos conta corrente'
                                    )
                                ]),
                                m('.w-col.w-col-6',
                                    m('.w-row', [
                                        m('.w-col.w-col-6.w-col-small-6.w-col-tiny-6.w-sub-col-middle', [
                                            m('label.text.required.field-label.field-label.fontweight-semibold.force-text-dark[for=\'user_bank_account_attributes_account\']',
                                                'No. da conta'
                                            ),
                                            m('input.string.required.w-input.text-field.positive[id=\'user_bank_account_attributes_account\'][type=\'text\']', {
                                                value: fields.account(),
                                                onchange: m.withAttr('value', fields.account),
                                                name: 'user[bank_account_attributes][account]'
                                            })
                                        ]),
                                        m('.w-col.w-col-6.w-col-small-6.w-col-tiny-6', [
                                            m('label.text.required.field-label.field-label.fontweight-semibold.force-text-dark[for=\'user_bank_account_attributes_account_digit\']',
                                                'Dígito conta'
                                            ),
                                            m('input.string.required.w-input.text-field.positive[id=\'user_bank_account_attributes_account_digit\'][type=\'text\']', {
                                                value: fields.account_digit(),
                                                onchange: m.withAttr('value', fields.account_digit),
                                                name: 'user[bank_account_attributes][account_digit]'
                                            })
                                        ])
                                    ])
                                )
                            ]),
                            (bankAccount.bank_account_id ?
                            m('input[id=\'user_bank_account_attributes_id\'][type=\'hidden\']', {
                                name: 'user[bank_account_attributes][id]',
                                value: fields.bank_account_id()
                            }) : '')
                        ]),
                        m('.u-margintop-30',
                            m('.w-container',
                                m('.w-row',
                                    m('.w-col.w-col-4.w-col-push-4',
                                        m('input.btn.btn-large[name=\'commit\'][type=\'submit\'][value=\'Salvar\']')
                                    )
                                )
                            )
                        )
                    ])
                ])
            )
        ]);
    }
};

export default userBilling;

