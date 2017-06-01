import m from 'mithril';
import userVM from '../vms/user-vm';
import postgrest from 'mithril-postgrest';
import _ from 'underscore';
import models from '../models';
import h from '../h';
import popNotification from './pop-notification';
import UserOwnerBox from './user-owner-box';
import inlineError from './inline-error';
import userSettingsVM from '../vms/user-settings-vm';

const userBankForm = {
    controller(args) {
        let parsedErrors = args.parsedErrors;
        const fields = args.fields,
              user = args.user,
              bankAccount = m.prop({}),
              banks = m.prop(),
              banksLoader = postgrest.loader(models.bank.getPageOptions()),
              showOtherBanks = h.toggleProp(false, true),
              showOtherBanksInput = m.prop(false),
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
              }];

        userVM.getUserBankAccount(user.id).then((data) => {
            if (!_.isEmpty(_.first(data))) {
                bankAccount(_.first(data));
                fields.bank_account_id(bankAccount().bank_account_id);
                fields.account(bankAccount().account);
                fields.account_digit(bankAccount().account_digit);
                fields.agency(bankAccount().agency);
                fields.agency_digit(bankAccount().agency_digit);
                fields.bank_id(bankAccount().bank_id);
                fields.bank_account_type(bankAccount().account_type);
                args.bankCode(bankAccount().bank_id);
            } else {
                fields.bank_account_type('conta_corrente');
            }
        });
        banksLoader.load().then(banks);

        return {
            bankInput: args.bankInput,
            bankCode: args.bankCode,
            banks,
            banksLoader,
            showOtherBanksInput,
            showOtherBanks,
            popularBanks,
            bankAccount,
            parsedErrors
        };
    },
    view(ctrl, args) {
        let user = args.user,
            fields = args.fields,
            bankAccount = ctrl.bankAccount();
        return m('div', [
            m('.w-row', [
                m(`.w-col.w-col-5.w-sub-col${ctrl.showOtherBanksInput() ? '.w-hidden' : ''}[id='bank_select']`,
                  m('.input.select.required.user_bank_account_bank_id', [
                      m('label.field-label.fontsize-smaller',
                        'Banco'
                       ),
                      m('select.select.required.w-input.text-field.bank-select.positive[id=\'user_bank_account_attributes_bank_id\']', {
                          name: 'user[bank_account_attributes][bank_id]',
                          class: ctrl.parsedErrors.hasError('bank_id') ? 'error' : false,
                          onchange: (e) => {
                              m.withAttr('value', ctrl.bankCode)(e);
                              ctrl.showOtherBanksInput(ctrl.bankCode() == '0');
                          }
                      }, [
                          m('option[value=\'\']', {
                              selected: fields.bank_id() === ''
                          }),
                          (_.map(ctrl.popularBanks, bank => (fields.bank_id() != bank.id ? m(`option[value='${bank.id}']`, {
                              selected: fields.bank_id() == bank.id
                          },
                                                                                             `${bank.code} . ${bank.name}`) : ''))),
                          (fields.bank_id() === '' || _.find(ctrl.popularBanks, bank => bank.id === fields.bank_id()) ? '' :
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
                       ),
                      ctrl.parsedErrors.inlineError('bank_id')
                  ])
                 ),
                (ctrl.showOtherBanksInput() ?
                 m('.w-col.w-col-5.w-sub-col',
                   m('.w-row.u-marginbottom-20[id=\'bank_search\']',
                     m('.w-col.w-col-12', [
                         m('.input.string.optional.user_bank_account_input_bank_number', [
                             m('label.field-label.fontsize-smaller',
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
                             height: '395px'
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
                                _.map(ctrl.banks(), bank => m('.w-row.card.fontsize-smallest', [
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
                                ])) : '')
                           ])
                       ])
                      )
                    )
                  ) : ''),
                m('.w-col.w-col-7',
                  m('.w-row', [
                      m('.w-col.w-col-7.w-col-small-7.w-col-tiny-7.w-sub-col-middle', [
                          m('label.text.required.field-label.field-label.fontweight-semibold.force-text-dark.fontsize-smaller[for=\'user_bank_account_attributes_agency\']',
                            'Agência'
                           ),
                          m('input.string.required.w-input.text-field.positive[id=\'user_bank_account_attributes_agency\'][type=\'text\']', {
                              value: fields.agency(),
                              class: ctrl.parsedErrors.hasError('agency') ? 'error' : false,
                              name: 'user[bank_account_attributes][agency]',
                              onchange: m.withAttr('value', fields.agency)
                          }),
                          ctrl.parsedErrors.inlineError('agency')
                      ]),
                      m('.w-col.w-col-5.w-col-small-5.w-col-tiny-5', [
                          m('label.text.optional.field-label.field-label.fontweight-semibold.force-text-dark.fontsize-smaller[for=\'user_bank_account_attributes_agency_digit\']',
                            'Dígito agência'
                           ),
                          m('input.string.optional.w-input.text-field.positive[id=\'user_bank_account_attributes_agency_digit\'][type=\'text\']', {
                              value: fields.agency_digit(),
                              class: ctrl.parsedErrors.hasError('agency_digit') ? 'error' : false,
                              name: 'user[bank_account_attributes][agency_digit]',
                              onchange: m.withAttr('value', fields.agency_digit)
                          }),
                          ctrl.parsedErrors.inlineError('agency_digit')
                      ])
                  ])
                 )
            ]),
            m('.w-row', [
                m('.w-col.w-col-5.w-sub-col', [
                    m('label.field-label.fontweight-semibold.fontsize-smaller',
                      'Tipo de conta'
                     ),
                    m('.input.select.required.user_bank_account_account_type', [
                        m('select.select.required.w-input.text-field.bank-select.positive[id=\'user_bank_account_attributes_account_type\']', {
                            name: 'user[bank_account_attributes][account_type]',
                            class: ctrl.parsedErrors.hasError('account_type') ? 'error' : false,
                            onchange: m.withAttr('value', fields.bank_account_type)
                        }, [
                            m('option[value=\'conta_corrente\']', {
                                selected: fields.bank_account_type() === 'conta_corrente'
                            }, 'Conta corrente'),
                            m('option[value=\'conta_poupanca\']', {
                                Selected: fields.bank_account_type() === 'conta_poupanca'
                            }, 'Conta poupança'),
                            m('option[value=\'conta_corrente_conjunta\']', {
                                selected: fields.bank_account_type() === 'conta_corrente_conjunta'
                            }, 'Conta corrente conjunta'),
                            m('option[value=\'conta_poupanca_conjunta\']', {
                                selected: fields.bank_account_type() === 'conta_poupanca_conjunta'
                            }, 'Conta poupança conjunta'),
                        ]),
                        ctrl.parsedErrors.inlineError('account_type')
                    ])
                ]),
                m('.w-col.w-col-7',
                  m('.w-row', [
                      m('.w-col.w-col-7.w-col-small-7.w-col-tiny-7.w-sub-col-middle', [
                          m('label.text.required.field-label.field-label.fontweight-semibold.force-text-dark.fontsize-smaller[for=\'user_bank_account_attributes_account\']',
                            'No. da conta'
                           ),
                          m('input.string.required.w-input.text-field.positive[id=\'user_bank_account_attributes_account\'][type=\'text\']', {
                              value: fields.account(),
                              class: ctrl.parsedErrors.hasError('account') ? 'error' : false,
                              onchange: m.withAttr('value', fields.account),
                              name: 'user[bank_account_attributes][account]'
                          }),
                          ctrl.parsedErrors.inlineError('account')
                      ]),
                      m('.w-col.w-col-5.w-col-small-5.w-col-tiny-5', [
                          m('label.text.required.field-label.field-label.fontweight-semibold.force-text-dark.fontsize-smaller[for=\'user_bank_account_attributes_account_digit\']',
                            'Dígito conta'
                           ),
                          m('input.string.required.w-input.text-field.positive[id=\'user_bank_account_attributes_account_digit\'][type=\'text\']', {
                              value: fields.account_digit(),
                              class: ctrl.parsedErrors.hasError('account_digit') ? 'error' : false,
                              onchange: m.withAttr('value', fields.account_digit),
                              name: 'user[bank_account_attributes][account_digit]'
                          }),
                          ctrl.parsedErrors.inlineError('account_digit')
                      ])
                  ])
                 )
            ]),
            (bankAccount.bank_account_id ?
             m('input[id=\'user_bank_account_attributes_id\'][type=\'hidden\']', {
                 name: 'user[bank_account_attributes][id]',
                 value: fields.bank_account_id()
             }) : '')
        ]);
    }
};

export default userBankForm;
