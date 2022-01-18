import m from 'mithril';
import h from '../h';
import _ from 'underscore';

const adminContribution = {
    view: function({attrs}) {
        const contribution = attrs.item;
        const contributionScope = _.partial(h.i18nScope, 'users.contribution_row');

        return m('.w-row.admin-contribution', [
            m('.fontweight-semibold.lineheight-tighter.u-marginbottom-10.fontsize-small', `R$${contribution.value}`,
            (contribution.payment_method === 'BoletoBancario' ?
              m('span.fontsize-smallest.fontcolor-secondary',
                ` (+R$ ${h.formatNumber((contribution.slip_fee || 0), 2, 3)} ${window.I18n.t('slip_fee', contributionScope())} )`) : '')),
            m('.fontsize-smallest.fontcolor-secondary', h.momentify(contribution.created_at, 'DD/MM/YYYY HH:mm[h]')),
            m('.fontsize-smallest', [
                'ID do Gateway: ',
                m(`a.alt-link[target="_blank"][href="https://dashboard.pagar.me/#/transactions/${contribution.gateway_id}"]`, contribution.gateway_id)
            ])
        ]);
    }
};

export default adminContribution;
