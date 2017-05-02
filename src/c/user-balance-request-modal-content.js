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
import I18n from 'i18n-js';
import h from '../h';
import models from '../models';
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
        },

              bankInput = m.prop(''),
              bankCode = m.prop('-1'),
              vm = postgrest.filtersVM({ user_id: 'eq' }),
              balance = args.balance,
              loaderOpts = models.balanceTransfer.postOptions({
                  user_id: balance.user_id }),
              requestLoader = postgrest.loaderWithToken(loaderOpts),
              loading = m.prop(false),
              displayDone = h.toggleProp(false, true),
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

                      loading(false);
                      m.redraw();
                      requestFund();
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
                      displayDone.toggle();
                  });
              };

        args.bankAccountManager.load();

        return {
            loading,
            requestLoader,
            requestFund,
            bankAccounts: args.bankAccountManager.collection,
            displayDone,
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
        console.log(args);
        const balance = args.balance;

        return (ctrl.loadBankA() ? h.loader() : m('div', _.map(ctrl.bankAccounts(), item => [
            m('.modal-dialog-header', [
                m('.fontsize-large.u-text-center', I18n.t('withdraw', I18nScope()))
            ]),
                (ctrl.displayDone() ? m('.modal-dialog-content.u-text-center', [
                    m('.fa.fa-check-circle.fa-5x.text-success.u-marginbottom-40'),
                    m('p.fontsize-large', I18n.t('success_message', I18nScope()))
                ]) : m('.modal-dialog-content', [
                    m('.fontsize-base.u-marginbottom-20', [
                        m('span.fontweight-semibold', 'Valor:'),
                        m.trust('&nbsp;'),
                        m('span.text-success', `R$ ${h.formatNumber(balance.amount, 2, 3)}`)
                    ]),
                    m(UserOwnerBox, {user: args.user, hideAvatar: true}),
                    m(userBankForm, {user: args.user, parsedErrors: ctrl.parsedErrors, fields: ctrl.fields, bankCode: ctrl.bankCode, bankInput: ctrl.bankInput })
                ])),
                (!ctrl.displayDone() ?
                 m('.modal-dialog-nav-bottom', { style: 'position: relative;'}, [
                     m('.w-row', [
                         m('.w-col.w-col-3'),
                         m('.w-col.w-col-6', [
                             (ctrl.requestLoader() || ctrl.loading() ?
                              h.loader()
                              : m('a.btn.btn-large.btn-request-fund[href="js:void(0);"]',
                                  { onclick: () => ctrl.updateUserData(args.user.id) },
                                  'Solicitar saque'))
                         ]),
                         m('.w-col.w-col-3')
                     ])
                 ]) : '')
        ])));
    }
};

export default userBalanceRequestModelContent;
