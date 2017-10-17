import m from 'mithril';
import _ from 'underscore';
import h from '../h';

const projectGoalsBox = {
    controller(args) {
        // @TODO make dynamic
        const currentGoalIndex = m.prop(0);
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
        return { currentGoalIndex, nextGoal, previousGoal };
    },
    view(ctrl, args) {
        const goals = args.goalDetails().length > 0 ? args.goalDetails() : [{
            title: 'N/A',
            value: '',
            description: ''
        }],
            currentGoalIndex = ctrl.currentGoalIndex;

        return m('div',
          m('.card.u-marginbottom-30.u-radius', [
              m('.w-clearfix', [
                  m('.u-right', [
                      m('button.btn.btn-inline.btn-small.btn-terciary.fa.fa-angle-left.w-button', { onclick: ctrl.previousGoal, class: currentGoalIndex() === 0 ? 'btn-desactivated' : '' }),
                      m('button.btn.btn-inline.btn-small.btn-terciary.fa.fa-angle-right.w-button', { onclick: ctrl.nextGoal, class: currentGoalIndex() === goals.length - 1 ? 'btn-desactivated' : '' })
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
                    m('.meter-fill')
                ),
                  m('.fontsize-smaller.fontweight-semibold.u-margintop-10',
                    `R$0 de R$${goals[currentGoalIndex()].value} por mês`
                )
              ]),
              m('.fontsize-smaller', [
                  goals[currentGoalIndex()].description
              ])
          ]));
    }
};

export default projectGoalsBox;
