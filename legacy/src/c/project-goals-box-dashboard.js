import m from 'mithril';
import _ from 'underscore';
import h from '../h';

const projectGoalsBoxDashboard = {
    controller: function(args) {
        const initialGoalIndex = args.goalDetails().length > 0 ? _.findIndex(args.goalDetails(), goal => goal.value > args.amount) : 0;
        const currentGoalIndex = m.prop(initialGoalIndex);
        const nextGoal = () => {
            if (currentGoalIndex() < args.goalDetails().length - 1) {
                currentGoalIndex((currentGoalIndex() + 1));
            }
        };
        const previousGoal = () => {
            if (currentGoalIndex() > 0) {
                currentGoalIndex((currentGoalIndex() - 1));
                m.redraw();
            }
        };
        if (currentGoalIndex() === -1) {
            currentGoalIndex(args.goalDetails().length - 1);
        }
        return {
            currentGoalIndex,
            nextGoal,
            previousGoal
        };
    },
    view: function(ctrl, args) {
        const goals = args.goalDetails().length > 0 ? args.goalDetails() : [{
                title: 'N/A',
                value: '',
                description: ''
            }],
            currentGoalIndex = ctrl.currentGoalIndex,
            goalPercentage = (args.amount / goals[currentGoalIndex()].value) * 100;

        return m('.card.card-terciary.flex-column.u-marginbottom-10.u-radius.w-clearfix', [
            m('.u-right', [
                m('button.btn-inline.btn-terciary.fa.fa-angle-left.u-radius.w-inline-block', {
                    onclick: ctrl.previousGoal,
                    class: currentGoalIndex() === 0 ? 'btn-desactivated' : ''
                }),
                m('button.btn-inline.btn-terciary.fa.fa-angle-right.u-radius.w-inline-block', {
                    onclick: ctrl.nextGoal,
                    class: currentGoalIndex() === goals.length - 1 ? 'btn-desactivated' : ''
                })
            ]),
            m('.fontsize-small.u-marginbottom-10',
                    'Metas'
                ),
            m('.fontsize-largest.fontweight-semibold',
                    `${Math.floor(goalPercentage)}%`
                ),
            m('.meter.u-marginbottom-10',
                    m('.meter-fill', {
                        style: {
                            width: `${(goalPercentage > 100 ? 100 : goalPercentage)}%`
                        }
                    })
                ),
            m('.fontcolor-secondary.fontsize-smallest.fontweight-semibold.lineheight-tighter',
                    goals[currentGoalIndex()].title
                ),
            m('.fontcolor-secondary.fontsize-smallest',
                    `R$${args.amount} de R$${goals[currentGoalIndex()].value} por mês`
                )
        ]);
    }
};

export default projectGoalsBoxDashboard;
