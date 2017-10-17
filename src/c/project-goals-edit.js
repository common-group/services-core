import m from 'mithril';
import _ from 'underscore';
import h from '../h';
import projectGoalEditCard from './project-goal-edit-card';
import projectGoalCard from './project-goal-card';
import projectGoalsVM from '../vms/project-goals-vm';
import popNotification from './pop-notification';

const I18nScope = _.partial(h.i18nScope, 'projects.dashboard_goal');

const projectGoalsEdit = {
    controller(args) {
        const goals = projectGoalsVM.goals;
        const showSuccess = m.prop(false);
        const error = m.prop(false);

        projectGoalsVM.fetchGoalsEdit(args.projectId);

        return {
            showSuccess,
            error,
            goals,
            addGoal: projectGoalsVM.addGoal
        };
    },

    view(ctrl, args) {
        const showSuccess = ctrl.showSuccess,
            error = ctrl.error;
        return m('.w-container',
            m('.w-row', [
                (ctrl.showSuccess() ? m.component(popNotification, {
                    message: 'Meta salva com sucesso'
                }) : ''),
                (ctrl.error() ? m.component(popNotification, {
                    message: 'Erro ao salvar informações',
                    error: true
                }) : ''),

                m('.w-col.w-col-1'),
                m('.w-col.w-col-10',
                    m('.w-form', [
                        m('div',
                            m(".card.card-terciary.medium.u-marginbottom-30[id='arrecadacao']", [
                                m('.u-marginbottom-30', [
                                    m("label.fontsize-base.fontweight-semibold[for='name-8']",
                                        'O que você vai alcançar com os apoios de seus assinantes?'
                                    ),
                                    m('.fontsize-small', [
                                        'As metas são a melhor maneira de deixar seus assinantes envolvidos no próximo passo de sua jornada criativa. Use-as para mostrar, de forma clara, o que vocês estarão conquistando',
                                        m.trust('&nbsp;'),
                                        'juntos com o sucesso de seu Catarse Assinaturas.'
                                    ])
                                ]),
                                _.map(ctrl.goals(), (goal) => {
                                    if (goal().editing()) {
                                        return m(projectGoalEditCard, {
                                            goal,
                                            showSuccess,
                                            error
                                        });
                                    }
                                    return m(projectGoalCard, {
                                        goal
                                    });
                                }),
                                m('button.btn.btn-large.btn-message', {
                                    onclick: () => {
                                        ctrl.addGoal(args.projectId);
                                    }
                                }, [
                                    '+ ',
                                    m.trust('&nbsp;'),
                                    ' Adicionar meta'
                                ])
                            ])
                        )
                    ])
                ),
                m('.w-col.w-col-1')
            ])
        );
    }
};

export default projectGoalsEdit;
