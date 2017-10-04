import m from 'mithril';
import _ from 'underscore';
import h from '../h';
import projectGoalsVM from '../vms/project-goals-vm';

const projectGoalEditCard = {
    controller(args) {
        const goal = args.goal();
        const destroyed = m.prop(false);

        const acceptNumeric = (e) => {
            goal.value(e.target.value.replace(/[^0-9]/g, ''));
            return true;
        };
        const confirmDelete = () => {
            const r = confirm('Você tem certeza?');
            if (r) {
                if (!goal.id()) { destroyed(true); return false; }
                return m.request({
                    method: 'DELETE',
                    url: `/projects/${goal.project_id()}/goals/${goal.id()}`,
                    config: h.setCsrfToken
                }).then(() => {
                    destroyed(true);
                    m.redraw();
                });
            }
            return false;
        };
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
                    goal.editing.toggle();
                });
            } else {
                projectGoalsVM.createGoal(goal.project_id(), data).then((r) => {
                    goal.id(r.goal_id);
                    goal.editing.toggle();
                });
            }
            return false;
        };
        return {
            confirmDelete,
            acceptNumeric,
            destroyed,
            saveGoal
        };
    },
    view(ctrl, args) {
        const goal = args.goal();

        return ctrl.destroyed() ? m('div', '') : m('.card.u-marginbottom-30', [
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
                                oninput: e => ctrl.acceptNumeric(e),
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
                m('.w-sub-col.w-col.w-col-5',
                    m('button.btn.btn-small.w-button', {
                        onclick: ctrl.saveGoal
                    }, 'Salvar')
                ),
                (args.goal().id() ?
                m('.w-sub-col.w-col.w-col-6',
                    m('button.btn.btn-small.btn-terciary.w-button', { onclick: () => { args.goal().editing.toggle(); } }, 'Cancelar')
                ) : ''),
                m('.w-col.w-col-1',
                    m('button.btn.btn-inline.btn-no-border.btn-small.btn-terciary.fa.fa-lg.fa-trash', { onclick: ctrl.confirmDelete })
                )
            ])
        ]);
    }
};

export default projectGoalEditCard;
