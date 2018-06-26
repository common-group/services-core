/**
 * window.c.UserBalanceRequestModalContent component
 * Render the current user bank account to confirm fund request
 *
 * Example:
 * m.component(c.UserBalanceRequestModelContent, {
 *     balance: {user_id: 123, amount: 123} // userBalance struct
 * })
 */
import m from 'mithril';
import _ from 'underscore';
import {catarse} from '../api'
import h from '../h';
import models from '../models';
import userVM from '../vms/user-vm';
import UserOwnerBox from './user-owner-box';
import userBankForm from './user-bank-form';
import userSettingsVM from '../vms/user-settings-vm';

const I18nScope = _.partial(h.i18nScope, 'users.balance');

const userBalanceRequestModelContent = {
    controller(args) {
        let parsedErrors = userSettingsVM.mapRailsErrors(args.rails_errors);

        const fields = {
            agency: m.prop(''),
            bank_id: m.prop(''),
            agency_digit: m.prop(''),
            account: m.prop(''),
            account_digit: m.prop(''),
            bank_account_id: m.prop(''),
            bank_account_type: m.prop('')
        };

        let bankAccounts = m.prop([]);

        const bankInput = m.prop(''),
              bankCode = m.prop('-1'),
              vm = catarse.filtersVM({ user_id: 'eq' }),
              balance = args.balance,
              loaderOpts = models.balanceTransfer.postOptions({
                  user_id: balance.user_id }),
              requestLoader = catarse.loaderWithToken(loaderOpts),
              loading = m.prop(false),
              displayDone = h.toggleProp(false, true),
              displayConfirmation = h.toggleProp(false, true),
              updateUserData = (user_id) => {
                  const userData = {};
                  userData.bank_account_attributes = {
                      bank_id: bankCode(),
                      input_bank_number: bankInput(),
                      agency_digit: fields.agency_digit(),
                      agency: fields.agency(),
                      account: fields.account(),
                      account_digit: fields.account_digit(),
                      account_type: fields.bank_account_type()
                  };

                  if ((fields.bank_account_id())) {
                      userData.bank_account_attributes.id = fields.bank_account_id().toString();
                  }

                  loading(true);
                  m.redraw();
                  return m.request({
                      method: 'PUT',
                      url: `/users/${user_id}.json`,
                      data: { user: userData },
                      config: h.setCsrfToken
                  }).then((data) => {
                      if (parsedErrors) {
                          parsedErrors.resetFieldErrors();
                      }

                      userVM.getUserBankAccount(user_id).then(bankAccounts);
                      loading(false);
                      displayConfirmation(true);
                      m.redraw();
                  }).catch((err) => {
                      if (parsedErrors) {
                          parsedErrors.resetFieldErrors();
                      }
                      parsedErrors = userSettingsVM.mapRailsErrors(err.errors_json);
                      loading(false);
                      m.redraw();
                  });
              },
              requestFund = () => {
                  requestLoader.load().then((data) => {
                      args.balanceManager.load();
                      args.balanceTransactionManager.load();
                      displayConfirmation(false);
                      displayDone.toggle();
                      m.redraw();
                  });
              };

        return {
            loading,
            requestLoader,
            requestFund,
            bankAccounts,
            displayDone,
            displayConfirmation,
            loadBankA: args.bankAccountManager.loader,
            updateUserData,
            requestFund,
            parsedErrors,
            fields,
            bankInput,
            bankCode
        };
    },
    view(ctrl, args) {
        const balance = args.balance,
              fields = ctrl.fields,
              user = args.user;

        return m('div', [
            m('.modal-dialog-header', [
                m('.fontsize-large.u-text-center', window.I18n.t('withdraw', I18nScope()))
            ]),
            (ctrl.displayConfirmation() ? m('.modal-dialog-content.u-text-center', (
                ctrl.loadBankA() ? h.loader() : _.map(ctrl.bankAccounts(), item => [
                 m('.fontsize-base.u-marginbottom-20', [
                     m('span.fontweight-semibold', `${window.I18n.t('value_text', I18nScope())}:`),
                     m.trust('&nbsp;'),
                     m('span.text-success',
                       window.I18n.t('shared.currency', {amount: h.formatNumber(balance.amount, 2, 3)})
                      )
                 ]),
                 m('.fontsize-base.u-marginbottom-10', [
                     m('span', { style: { 'font-weight': ' 600' } }, window.I18n.t('bank.account', I18nScope()))
                 ]),
                 m('.fontsize-small.u-marginbottom-10', [
                     m('div', [
                         m('span.fontcolor-secondary', window.I18n.t('bank.name', I18nScope())),
                         m.trust('&nbsp;'),
                         item.owner_name
                     ]),
                     m('div', [
                         m('span.fontcolor-secondary', window.I18n.t('bank.cpf_cnpj', I18nScope())),
                         m.trust('&nbsp;'),
                         item.owner_document
                     ]),
                     m('div', [
                         m('span.fontcolor-secondary', window.I18n.t('bank.bank_name', I18nScope())),
                         m.trust('&nbsp;'),
                         item.bank_name
                     ]),
                     m('div', [
                         m('span.fontcolor-secondary', window.I18n.t('bank.agency', I18nScope())),
                         m.trust('&nbsp;'),
                         `${item.agency}-${item.agency_digit}`
                     ]),
                     m('div', [
                         m('span.fontcolor-secondary', window.I18n.t('bank.account', I18nScope())),
                         m.trust('&nbsp;'),
                         `${item.account}-${item.account_digit}`
                     ])
                 ])
                ])
            )) : (
                ctrl.displayDone() ? m('.modal-dialog-content.u-text-center', [
                 m('.fa.fa-check-circle.fa-5x.text-success.u-marginbottom-40'),
                 m('p.fontsize-large', window.I18n.t('success_message', I18nScope()))
             ]) : m('.modal-dialog-content', [
                 m('.fontsize-base.u-marginbottom-20', [
                     m('span.fontweight-semibold', `${window.I18n.t('value_text', I18nScope())}:`),
                     m.trust('&nbsp;'),
                     m('span.text-success',
                       window.I18n.t('shared.currency', {amount: h.formatNumber(balance.amount, 2, 3)})
                      )
                 ]),
                 m(UserOwnerBox, {user: args.user, hideAvatar: true}),
                 m(userBankForm, {user: args.user, parsedErrors: ctrl.parsedErrors, fields: ctrl.fields, bankCode: ctrl.bankCode, bankInput: ctrl.bankInput })
             ]))),
            (ctrl.displayConfirmation() ? m('.modal-dialog-nav-bottom', { style: 'position: relative'}, [
                m('.w-row', [
                    m('.w-col.w-col-1'),
                    m('.w-col.w-col-5',
                        (ctrl.requestLoader() || ctrl.loading() ?
                         h.loader()
                         : [
                             m('a.btn.btn-medium.btn-request-fund[href="javascript:void(0);"]',
                               { onclick: () => ctrl.requestFund() },
                               window.I18n.t('shared.confirm_text')),
                         ])
                    ),
                    m('.w-col.w-col-5',
                      (ctrl.requestLoader() || ctrl.loading() ?
                       ''
                       : [
                           m('a.btn.btn-medium.btn-terciary.w-button', {
                               onclick: ctrl.displayConfirmation.toggle
                           }, window.I18n.t('shared.back_text'))
                       ])
                     ),
                    m('.w-col.w-col-1')
                ])
            ]) : ''),
            (!ctrl.displayConfirmation() && !ctrl.displayDone() ?
             m('.modal-dialog-nav-bottom', { style: 'position: relative;'}, [
                 m('.w-row', [
                     m('.w-col.w-col-3'),
                     m('.w-col.w-col-6', [
                         (ctrl.requestLoader() || ctrl.loading() ?
                          h.loader()
                          : m('a.btn.btn-large.btn-request-fund[href="javascript:void(0);"]',
                              { onclick: () => ctrl.updateUserData(args.user.id) },
                              window.I18n.t('request_fund', I18nScope())))
                     ]),
                     m('.w-col.w-col-3')
                 ])
             ]) : '')
        ]);
    }
};

export default userBalanceRequestModelContent;
