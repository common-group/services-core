import m from 'mithril';
import _ from 'underscore';
import h from '../h';

const projectRewardList = {
    controller(args) {
        const contributionValue = m.prop(),
            openedReward = m.prop(-1),
            chooseReward = () => {console.log('reward: ', openedReward(), ' contributionValue: ', h.monetaryToFloat(contributionValue)); return false;};

        const applyMask = _.compose(contributionValue, h.applyMonetaryMask);

        const selectReward = (reward) => () => {
            openedReward(reward.id);
            contributionValue(h.applyMonetaryMask(reward.minimum_value + ',00'));
        };

        const setInput = (el, isInitialized) => !isInitialized ? el.focus() : false;

        return {
            applyMask: applyMask,
            chooseReward: chooseReward,
            openedReward: openedReward,
            selectReward: selectReward,
            contributionValue: contributionValue,
            setInput: setInput
        };
    },
    view(ctrl, args) {
        //FIXME: MISSING ADJUSTS
        // - add draft admin modifications
        const project = args.project() || {open_for_contributions: false};
        return m('#rewards.u-marginbottom-30', _.map(args.rewardDetails(), (reward) => {


            return m('div[class="' + (h.rewardSouldOut(reward) ? 'card-gone' : 'card-reward ' + (project.open_for_contributions ? 'clickable' : '')) + ' card card-secondary u-marginbottom-10"]', {
                onclick: h.analytics.event({cat: 'contribution_create',act: 'contribution_reward_click', lbl: reward.minimum_value, project: project, extraData: {reward_id: reward.id, reward_value: reward.minimum_value}})
            }, [
                m('.u-marginbottom-20', [
                    m('.fontsize-base.fontweight-semibold', 'Para R$ ' + h.formatNumber(reward.minimum_value) + ' ou mais'),
                    m('.fontsize-smaller.fontweight-semibold', h.pluralize(reward.paid_count, ' apoio', ' apoios')), (reward.maximum_contributions > 0 ? [
                        (reward.waiting_payment_count > 0 ? m('.maximum_contributions.in_time_to_confirm.clearfix', [
                            m('.pending.fontsize-smallest.fontcolor-secondary', h.pluralize(reward.waiting_payment_count, ' apoio em prazo de confirmação', ' apoios em prazo de confirmação.'))
                        ]) : ''), (h.rewardSouldOut(reward) ? m('.u-margintop-10', [
                            m('span.badge.badge-gone.fontsize-smaller', 'Esgotada')
                        ]) : m('.u-margintop-10', [
                            m('span.badge.badge-attention.fontsize-smaller', [
                                m('span.fontweight-bold', 'Limitada'),
                                ' (' + h.rewardRemaning(reward) + ' de ' + reward.maximum_contributions + ' disponíveis)'
                            ])
                        ]))
                    ] : ''),
                ]),

                m('.fontsize-smaller.u-margintop-20', m.trust(h.simpleFormat(h.strip(reward.description)))),
                (!_.isEmpty(reward.deliver_at) ?
                    m('.fontsize-smaller', [
                        m('b', 'Estimativa de Entrega: '),
                        h.momentify(reward.deliver_at, 'MMM/YYYY')
                    ])
                : ''),
                (project.open_for_contributions && !h.rewardSouldOut(reward) ? [
                    ctrl.openedReward() === reward.id ? m('.w-form',
                    	[
                    		m('form.u-margintop-30', {
                                    onsubmit: ctrl.chooseReward
                                },[
                    				m('.divider.u-marginbottom-20'),
                    				m('.fontcolor-secondary.u-marginbottom-10',
                    					'Valor do apoio'
                    				),
                    				m('.w-row.u-marginbottom-20',
                    					[
                    						m('.w-col.w-col-3.w-col-small-3.w-col-tiny-3',
                    							m('.back-reward-input-reward.placeholder',
                    								'R$'
                    							)
                    						),
                    						m('.w-col.w-col-9.w-col-small-9.w-col-tiny-9',
                    							m('input.w-input.back-reward-input-reward[type="tel"]', {
                                                    config: ctrl.setInput,
                                                    onkeyup: m.withAttr('value', ctrl.applyMask),
                                                    value: ctrl.contributionValue()
                                                })
                    						)
                    					]
                    				),
                    				m('input.w-button.btn.btn-medium[type="submit"][value="Continuar >"]')
                    			]
                    		)
                    	]
                    ) : m('.project-reward-box-hover', { onclick: ctrl.selectReward(reward) }, [
                        m('.project-reward-box-select-text.u-text-center', 'Selecione essa recompensa')
                    ])
                ] : '')
            ]);
        }));
    }
};

export default projectRewardList;
