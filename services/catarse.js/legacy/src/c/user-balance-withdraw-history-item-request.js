import m from 'mithril';
import _ from 'underscore';
import h from '../h';

const I18nScopeTransfer = _.partial(h.i18nScope, 'users.balance.transfer_labels');
const I18nScopeBank = _.partial(h.i18nScope, 'users.balance.bank');

const userBalanceWithdrawHistoryItemRequest = {
    oninit: function (vnode) {

        const documentMask = _.partial(h.mask, '999.999.999-99');
        const documentCompanyMask = _.partial(h.mask, '99.999.999/9999-99');

        const cardStatusClassMap = {
            pending: '.card-alert',
            authorized: '.card-alert',
            processing: '.card-alert',

            error: '.card-alert',
            gateway_error: '.card-alert',
            rejected: '.card-alert',

            transferred: '.card-greenlight'
        };

        const innerCardStatusClassMap = {
            pending: '.badge-attention',
            authorized: '.badge-attention',
            processing: '.badge-attention',

            error: '.card-error',
            gateway_error: '.card-error',
            rejected: '.card-error',

            transferred: '.badge-success'
        };

        const contactUrl = 'https://suporte.catarse.me/hc/pt-br/signin?return_to=https%3A%2F%2Fsuporte.catarse.me%2Fhc%2Fpt-br%2Frequests%2Fnew&amp;locale=19';

        const initialStateInfoRender = [
            m('span.fa.fa-clock-o', m.trust('&nbsp;')),
            I18n.t('funding_estimated_date', I18nScopeTransfer()),
            h.momentify(vnode.attrs.transfer.funding_estimated_date, 'DD/MM/YYYY'),
            m('br')
        ];

        const errorStateInfoRender = [
            m('span.fa.fa-exclamation-circle', m.trust('&nbsp;')),
            I18n.t('transfer_error', I18nScopeTransfer()),
            m('br'),
            I18n.t('transfer_error_line1', I18nScopeTransfer()),
            m(`a.link-hidden-white[href='${contactUrl}'][target='_blank']`, 
                I18n.t('transfer_error_line2', I18nScopeTransfer())
            ),
            I18n.t('transfer_error_line3', I18nScopeTransfer()),
            m('a.link-hidden-white[href=\'#\']'),
            m('br')
        ];

        const successStateInfoRender = [
            m('span.fa.fa-check-circle', m.trust('&nbsp;')),
            I18n.t('received_at', I18nScopeTransfer()),
            h.momentify(vnode.attrs.transfer.transferred_at, 'DD/MM/YYYY'),
            m('br')
        ];

        const innerCardInfo = {
            pending: initialStateInfoRender,
            authorized: initialStateInfoRender,
            processing: initialStateInfoRender,

            error: errorStateInfoRender,
            gateway_error: errorStateInfoRender,
            rejected: errorStateInfoRender,

            transferred: successStateInfoRender
        };

        const documentMasked = (document_number) => vnode.attrs.transfer.document_type == 'cpf' ? documentMask(document_number) : documentCompanyMask(document_number);

        return {
            cardStatusClassMap,
            innerCardStatusClassMap,
            innerCardInfo,
            documentMasked
        };
    },
    view: function ({state, attrs}) {
        return m('.u-marginbottom-20.w-col.w-col-4',
            m(`.card.u-radius${ctrl.cardStatusClassMap[args.transfer.status]}`, [
                m('div', [
                    m('.fontsize-small', [
                        m('strong', I18n.t('amount', I18nScopeTransfer())),
                        `R$ ${h.formatNumber(args.transfer.amount || 0, 2, 3)}`,
                        m('br')
                    ]),
                    m('.fontsize-smaller.u-marginbottom-20', [
                        m('strong', I18n.t('requested_in', I18nScopeTransfer())),
                        h.momentify(args.transfer.requested_in, 'DD/MM/YYYY'),
                        m('br')
                    ])
                ]),
                m('.fontsize-smallest', [
                    m('strong', I18n.t('bank_name', I18nScopeBank())),
                    args.transfer.bank_name,
                    m('br'),
                    m('strong', I18n.t('agency', I18nScopeBank())),
                    `${args.transfer.agency}${args.transfer.agency_digit ? '-' + args.transfer.agency_digit : ''}`,
                    m('br'),
                    m('strong', I18n.t('account', I18nScopeBank())),
                    `${args.transfer.account}${args.transfer.account_digit ? '-' + args.transfer.account_digit : ''}`,
                    m('br'),
                    m('strong', I18n.t('account_type_name', I18nScopeBank())),
                    I18n.t(`account_type.${args.transfer.account_type}`, I18nScopeBank()),
                    m('br'),
                    m('strong', I18n.t('user_name', I18nScopeTransfer())),
                    args.transfer.user_name,
                    m('br'),
                    m('strong', I18n.t(`${args.transfer.document_type}`, I18nScopeBank())),
                    ctrl.documentMasked(args.transfer.document_number)
                ]),
                m(`.fontsize-smaller.u-text-center.badge.fontweight-semibold.u-margintop-30${ctrl.innerCardStatusClassMap[args.transfer.status]}`, ctrl.innerCardInfo[args.transfer.status])
            ])
        );
    }
};

export default userBalanceWithdrawHistoryItemRequest;