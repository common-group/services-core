import m from 'mithril';
import _ from 'underscore';
import h from '../h';
import projectGoalsVM from '../vms/project-goals-vm';

const projectGoalEditCard = {
    controller: function(args) {
        const goal = args.goal(),
            project = args.project,
            descriptionError = m.prop(false),
            titleError = m.prop(false),
            valueError = m.prop(false),
            validate = () => {
                args.error(false);
                descriptionError(false);
                valueError(false);
                if (_.isEmpty(goal.title())) {
                    args.error(true);
                    titleError(true);
                }
                if (_.isEmpty(goal.description())) {
                    args.error(true);
                    descriptionError(true);
                }
                if (!goal.value() || parseInt(goal.value()) < 10) {
                    args.error(true);
                    valueError(true);
                }
            };
        const destroyed = m.prop(false);

        const acceptNumeric = (e) => {
            goal.value(e.target.value.replace(/[^0-9]/g, ''));
            return true;
        };
        const confirmDelete = () => {
            const r = confirm('Você tem certeza?');
            if (r) {
                if (!goal.id()) {
                    destroyed(true);
                    return false;
                }
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
            validate();
            if (args.error()) {
                return false;
            }
            const data = {
                id: goal.id(),
                project_id: goal.project_id(),
                value: goal.value(),
                title: goal.title(),
                description: goal.description()
            };

            if (goal.id()) {
                projectGoalsVM.updateGoal(goal.project_id(), goal.id(), data).then(() => {
                    args.showSuccess(true);
                    goal.editing.toggle();
                });
            } else {
                projectGoalsVM.createGoal(goal.project_id(), data).then((r) => {
                    goal.id(r.goal_id);
                    args.showSuccess(true);
                    goal.editing.toggle();
                    m.redraw();
                });
            }
            return false;
        };
        return {
            confirmDelete,
            descriptionError,
            titleError,
            valueError,
            acceptNumeric,
            destroyed,
            saveGoal
        };
    },
    view: function(ctrl, args) {
        const goal = args.goal(),
            inlineError = message => m('.fontsize-smaller.text-error.u-marginbottom-20.fa.fa-exclamation-triangle',
                m('span',
                    message
                )
            );

        return ctrl.destroyed() ? m('div', '') :
            m('.card.u-marginbottom-30', [
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
                                    class: ctrl.valueError() ? 'error' : false,
                                    value: goal.value(),
                                    oninput: e => ctrl.acceptNumeric(e),
                                    onchange: m.withAttr('value', goal.value)
                                })
                            )
                        ])
                    )
                ]),

                ctrl.valueError() ? inlineError('A meta deve ser igual ou superior a R$10') : '',
                m('.w-row', [
                    m('.w-col.w-col-6',
                        m('.fontsize-small',
                            'Título:'
                        )
                    ),
                    m('.w-col.w-col-6',
                        m("input.positive.text-field.w-input[type='text']", {
                            value: goal.title(),
                            class: ctrl.descriptionError() ? 'error' : false,
                            onchange: m.withAttr('value', goal.title)
                        })
                    )
                ]),
                ctrl.titleError() ? inlineError('Título não pode ficar em branco.') : '',
                m('.w-row', [
                    m('.w-col.w-col-6',
                        m('.fontsize-small',
                            'Descrição da meta:'
                        )
                    ),
                    m('.w-col.w-col-6',
                        m("textarea.height-medium.positive.text-field.w-input[placeholder='O que você vai fazer se atingir essa meta?']", {
                            value: goal.description(),
                            class: ctrl.descriptionError() ? 'error' : false,
                            onchange: m.withAttr('value', goal.description)
                        })
                    )
                ]),
                ctrl.descriptionError() ? inlineError('Descrição não pode ficar em branco.') : '',
                m('.u-margintop-30.w-row', [
                    m('.w-sub-col.w-col.w-col-5',
                        m('button.btn.btn-small.w-button', {
                            onclick: ctrl.saveGoal
                        }, 'Salvar')
                    ),
                    (args.goal().id() ?
                        m('.w-sub-col.w-col.w-col-6',
                            m('button.btn.btn-small.btn-terciary.w-button', {
                                onclick: () => {
                                    args.goal().editing.toggle();
                                }
                            }, 'Cancelar')
                        ) : ''),
                    m('.w-col.w-col-1',
                        m('button.btn.btn-inline.btn-no-border.btn-small.btn-terciary.fa.fa-lg.fa-trash', {
                            onclick: ctrl.confirmDelete
                        })
                    )
                ])
            ]);
    }
};

export default projectGoalEditCard;
