import m from 'mithril';
import _ from 'underscore';
import h from '../h';
import rewardVM from '../vms/reward-vm';

const projectRewardList = {
    controller(args) {
        const storeKey = 'selectedReward',
            contributionValue = m.prop(),
            openedReward = m.prop({id: -1}),
            error = m.prop(''),
            chooseReward = () => {
                const valueFloat = h.monetaryToFloat(contributionValue),
                    openedReward = rewardVM.selectedReward;

                if (valueFloat < openedReward().minimum_value) {

                    error(`O valor dessa recompensa deve ser de no mínimo R$${openedReward().minimum_value}`);

                } else {

                    if (!h.getUser()) {

                        h.storeObject(storeKey, {value: valueFloat, reward: openedReward()});

                        return h.navigateToDevise('/' + args.project().permalink);

                    } else {

                        h.setReward(openedReward());

                        m.route('/contribution', {
                            reward_id: openedReward().id,
                            value: valueFloat,
                            mode: args.project().mode,
                            project_user_id: args.project().user_id
                        });

                    }
                }

                return false;
            };

        const applyMask = _.compose(contributionValue, h.applyMonetaryMask);

        const selectReward = (reward) => () => {
            if (rewardVM.selectedReward() !== reward){
                rewardVM.selectedReward(reward);

                contributionValue(h.applyMonetaryMask(reward.minimum_value + ',00'));
            }
        };

        const setInput = (el, isInitialized) => !isInitialized ? el.focus() : false;

        if (h.getStoredObject(storeKey)) {
            const {value, reward} = h.getStoredObject(storeKey);

            h.removeStoredObject(storeKey);
            selectReward(m.prop(reward));
            contributionValue(h.applyMonetaryMask(`${value},00`));
            chooseReward();
        }

        return {
            applyMask: applyMask,
            error: error,
            chooseReward: chooseReward,
            openedReward: rewardVM.selectedReward,
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
                onclick: h.analytics.event({cat: 'contribution_create',act: 'contribution_reward_click', lbl: reward.minimum_value, project: project, extraData: {reward_id: reward.id, reward_value: reward.minimum_value}}, ctrl.selectReward(reward))
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
                    ctrl.openedReward().id === reward.id ? m('.w-form',
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
                    				m('input.w-button.btn.btn-medium[type="submit"][value="Continuar >"]'),
                                    ctrl.error().length > 0 ? m('.text-error', [
                                        m('br'),
                                        m('span.fa.fa-exclamation-triangle'),
                                        ` ${ctrl.error()}`
                                    ]) : ''
                    			]
                    		)
                    	]
                    ) : '',
                    // m('.project-reward-box-hover', [
                    //     m('.project-reward-box-select-text.u-text-center', 'Selecione essa recompensa')
                    // ])
                ] : '')
            ]);
        }));
    }
};

export default projectRewardList;
