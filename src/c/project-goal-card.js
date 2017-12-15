import m from 'mithril';
import _ from 'underscore';
import I18n from 'i18n-js';
import h from '../h';

const I18nScope = _.partial(h.i18nScope, 'projects.contributions');

const projectGoalCard = {
    controller(args) {},
    view(ctrl, args) {
        const goal = args.goal();
        const currentGoal = args.currentGoal;

        return m('.card.u-marginbottom-30',
            m('.w-row', [
                m('.w-col.w-col-11.w-col-small-11.w-col-tiny-11', [
                    m('.fontsize-base.fontweight-semibold.u-marginbottom-20',
                        `Meta: R$${goal.value()}`
                    ),
                    m('.fontsize-small.fontweight-semibold',
                        goal.title()
                    ),
                    m('p.fontcolor-secondary.fontsize-small', [
                        goal.description()
                    ])
                ]),

                (currentGoal()) ? [
                    (
                        goal.value() > currentGoal().value() ?
                        m('.w-col.w-col-1.w-col-small-1.w-col-tiny-1',
                            m('button.btn.btn-inline.btn-no-border.btn-small.btn-terciary.fa.fa-edit.fa-lg', {
                                onclick: goal.editing.toggle
                            })
                        ) : ''
                    )
                ] :
                ''
            ])
        );
    }
};

export default projectGoalCard;
