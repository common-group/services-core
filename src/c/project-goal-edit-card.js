import m from 'mithril';
import _ from 'underscore';
import I18n from 'i18n-js';
import h from '../h';
import projectGoalsVM from '../vms/project-goals-vm';

const I18nScope = _.partial(h.i18nScope, 'projects.contributions');

const projectGoalEditCard = {
    controller(args) {
        const goal = args.goal();
        const saveGoal = () => {
            const data = {
                id: goal.id(),
                project_id: goal.project_id(),
                value: goal.value(),
                title: goal.title(),
                description: goal.description()
            };

            if (goal.id()) {
                projectGoalsVM.updateGoal(goal.project_id(), goal.id(), data).then(() => {
                    m.redraw();
                });
            } else {
                projectGoalsVM.createGoal(goal.project_id(), data);
            }
            return false;
        };
        return {
            saveGoal
        };
    },
    view(ctrl, args) {
        const goal = args.goal();

        return m('.card.u-marginbottom-30', [
            m('.w-row', [
                m('.w-col.w-col-6',
                    m('.fontsize-small',
                        'Meta:'
                    )
                ),
                m('.w-col.w-col-6',
                    m('.w-row', [
                        m('.prefix.text-field.w-col.w-col-4.w-col-small-6.w-col-tiny-6',
                            m('.fontcolor-secondary.fontsize-base.lineheight-tightest.u-text-center',
                                'R$'
                            )
                        ),
                        m('.w-col.w-col-8.w-col-small-6.w-col-tiny-6',
                            m("input.positive.postfix.text-field.w-input[type='text']", {
                                value: goal.value(),
                                onchange: m.withAttr('value', goal.value)
                            })
                        )
                    ])
                )
            ]),
            m('.w-row', [
                m('.w-col.w-col-6',
                    m('.fontsize-small',
                        'Título:'
                    )
                ),
                m('.w-col.w-col-6',
                    m("input.positive.text-field.w-input[type='text']", {
                        value: goal.title(),
                        onchange: m.withAttr('value', goal.title)
                    })
                )
            ]),
            m('.w-row', [
                m('.w-col.w-col-6',
                    m('.fontsize-small',
                        'Descrição da meta:'
                    )
                ),
                m('.w-col.w-col-6',
                    m("textarea.height-medium.positive.text-field.w-input[placeholder='O que você vai fazer se atingir essa meta?']", {
                        value: goal.description(),
                        onchange: m.withAttr('value', goal.description)
                    })
                )
            ]),
            m('.u-margintop-30.w-row', [
                m('._w-sub-col.w-col.w-col-5',
                    m('button.btn.btn-small.w-button', { onclick: ctrl.saveGoal }, 'Salvar')
                ),
                m('._w-sub-col.w-col.w-col-1',
                    m("a.btn.btn-inline.btn-no-border.btn-small.btn-terciary.fa.fa-lg.fa-trash[href='#']")
                ),
                m('.w-col.w-col-6')
            ])
        ]);
    }
};

export default projectGoalEditCard;
