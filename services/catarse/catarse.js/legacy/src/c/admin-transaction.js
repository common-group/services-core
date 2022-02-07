import m from 'mithril';
import h from '../h';
import _ from 'underscore';

const adminTransaction = {
    view: function({attrs}) {
        const contribution = attrs.contribution;
        const contributionScope = _.partial(h.i18nScope, 'users.contribution_row');

        return m('.w-col.w-col-4', [
            m('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-20', 'Detalhes do apoio'),
            m('.fontsize-smallest.lineheight-looser', [
                `Valor: R$${h.formatNumber(contribution.value, 2, 3)}`,
                (contribution.payment_method === 'BoletoBancario' ?
                m('span.fontsize-smallest.fontcolor-secondary',
                   ` (+R$ ${h.formatNumber((contribution.slip_fee || 0), 2, 3)} ${ window.I18n.t('slip_fee', contributionScope())})`
                ) : ''),
                m('br'),
                `Taxa: R$${h.formatNumber(contribution.gateway_fee, 2, 3)}`,
                m('br'),
                `Aguardando Confirmação: ${contribution.waiting_payment ? 'Sim' : 'Não'}`,
                m('br'),
                `Anônimo: ${contribution.anonymous ? 'Sim' : 'Não'}`,
                m('br'),
                `Id pagamento: ${contribution.gateway_id}`,
                m('br'),
                `Apoio: ${contribution.contribution_id}`,
                m('br'),
                'Chave: \n',
                m('br'),
                contribution.key,
                m('br'),
                `Meio: ${contribution.gateway}`,
                m('br'),
                `Operadora: ${contribution.gateway_data && contribution.gateway_data.acquirer_name}`,
                contribution.is_second_slip ? [m('br'), m('a.link-hidden[href="#"]', 'Boleto bancário'), ' ', m('span.badge', '2a via')] : '',
                contribution.is_second_pix ? [m('br'), m('a.link-hidden[href="#"]', 'Pix'), ' ', m('span.badge', '2a via')] : ''
            ])
        ]);
    }
};

export default adminTransaction;
