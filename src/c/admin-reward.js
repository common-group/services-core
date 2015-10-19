window.c.AdminReward = (function(m, c, h, _) {
    return {
        view: (ctrl, args) => {
            const reward = args.reward(),
                available = parseInt(reward.paid_count) + parseInt(reward.waiting_payment_count);

            return m('.w-col.w-col-4', [
                m('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-20', 'Recompensa'),
                m('.fontsize-smallest.lineheight-looser', reward.id ? [
                    'ID: ' + reward.id,
                    m('br'),
                    'Valor mínimo: R$' + h.formatNumber(reward.minimum_value, 2, 3),
                    m('br'),
                    m.trust('Disponíveis: ' + available + ' / ' + (reward.maximum_contributions || '&infin;')),
                    m('br'),
                    'Aguardando confirmação: ' + reward.waiting_payment_count,
                    m('br'),
                    'Descrição: ' + reward.description
                ] : 'Apoio sem recompensa')
            ]);
        }
    };
}(window.m, window.c, window.c.h, window._));
