window.c.vms.insight = ((I18n, h, _) => {
    const I18nScope = _.partial(h.i18nScope, 'projects.successful_onboard'),
        parseAccountData = (account, transfer) => {
            return {
                transfer_limit_date: h.momentify(account.transfer_limit_date),
                total_amount: h.formatNumber(transfer.total_amount),
                bank_name: account.bank_name,
                agency: `${account.agency}${account.agency_digit ? '-' + account.agency_digit : ''}`,
                account: `${account.account}${account.account_digit ? '-' + account.account_digit : ''}`,
                user_email: account.user_email
            };
        },
        content = (state, data) => {
            const translations = I18n.translations[I18n.currentLocale()].projects.successful_onboard[state],
                translationContext = parseAccountData(_.first(data.account()), _.first(data.transfer()));
            let contentObj = {};

            _.map(translations, (translation, translationKey) => {
                contentObj = _.extend({}, contentObj, {
                    [translationKey]: I18n.t(`${state}.${translationKey}`, I18nScope(translationContext))
                });
            });
            return contentObj;
        };

    return {
        content: content
    };
}(window.I18n, window.c.h, window._));
