import m from 'mithril';
import prop from 'mithril/stream';
import _ from 'underscore';
import h from '../h';

const projectGoalsBox = {
    oninit: function(vnode) {
        const subscriptionData = vnode.attrs.subscriptionData() || {
                amount_paid_for_valid_period: 0
            },
            initialGoalIndex = vnode.attrs.goalDetails().length > 0 ? _.findIndex(vnode.attrs.goalDetails(), goal => goal.value > subscriptionData.amount_paid_for_valid_period) : 0,
            currentGoalIndex = prop(initialGoalIndex),
            nextGoal = () => {
                if (currentGoalIndex() < vnode.attrs.goalDetails().length - 1) {
                    currentGoalIndex((currentGoalIndex() + 1));
                }
            },
            previousGoal = () => {
                if (currentGoalIndex() > 0) {
                    currentGoalIndex((currentGoalIndex() - 1));
                    m.redraw();
                }
            };
        // amount is higher than max goal
        if (currentGoalIndex() === -1) {
            currentGoalIndex(vnode.attrs.goalDetails().length - 1);
        }
        vnode.state = { currentGoalIndex, nextGoal, previousGoal, subscriptionData };
    },
    view: function({state, attrs}) {
        const goals = attrs.goalDetails().length > 0 ? attrs.goalDetails() : [{
                title: 'N/A',
                value: '',
                description: ''
            }],
            subscriptionData = state.subscriptionData,
            currentGoalIndex = state.currentGoalIndex,
            goalPercentage = (subscriptionData.amount_paid_for_valid_period / goals[currentGoalIndex()].value) * 100;

        return m('div',
          m(`.card.u-marginbottom-30.u-radius${attrs.style}`, [
              m('.w-clearfix', [
                  m('.u-right', [
                      m('button.btn.btn-inline.btn-small.btn-terciary.fa.fa-angle-left.w-button', { onclick: state.previousGoal, class: currentGoalIndex() === 0 ? 'btn-desactivated' : '' }),
                      m('button.btn.btn-inline.btn-small.btn-terciary.fa.fa-angle-right.w-button', { onclick: state.nextGoal, class: currentGoalIndex() === goals.length - 1 ? 'btn-desactivated' : '' })
                  ]),
                  m('.fontsize-base.fontweight-semibold.u-marginbottom-20.w-hidden-small.w-hidden-tiny',
                    m('span',
                        'Metas'
                    )
                )
              ]),
              m('.fontsize-small.fontweight-semibold', [
                  m('span.fontcolor-secondary.fontsize-smallest.u-right',
                    `${currentGoalIndex() + 1} de ${goals.length}`
                ),
                  goals[currentGoalIndex()].title
              ]),
              m('.u-marginbottom-10', [
                  m('.meter',
                    m('.meter-fill', {
                        style: {
                            width: `${(goalPercentage > 100 ? 100 : goalPercentage)}%`
                        }
                    })
                ),
                  m('.fontsize-smaller.fontweight-semibold.u-margintop-10',
                    `R$${subscriptionData.amount_paid_for_valid_period} de R$${goals[currentGoalIndex()].value} por mês`
                )
              ]),
              m('.fontsize-smaller', [
                  goals[currentGoalIndex()].description
              ])
          ]));
    }
};

export default projectGoalsBox;
