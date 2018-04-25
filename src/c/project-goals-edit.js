import m from 'mithril';
import models from '../models';
import _ from 'underscore';
import h from '../h';
import {
    commonAnalytics
} from '../api';
import projectGoalEditCard from './project-goal-edit-card';
import projectGoalCard from './project-goal-card';
import projectGoalsVM from '../vms/project-goals-vm';
import popNotification from './pop-notification';
import generateErrorInstance from '../error';
import railsErrorsVM from '../vms/rails-errors-vm';

const I18nScope = _.partial(h.i18nScope, 'projects.dashboard_goal');

const projectGoalsEdit = {
    controller(args) {
        const e = generateErrorInstance();
        const mapErrors = [
            ['goals', ['goals.size']]
        ];
        const goals = projectGoalsVM.goals;

        const l = commonAnalytics.loaderWithToken(models.projectSubscribersInfo.postOptions({
            id: args.project.common_id
        }));

        const currentGoal = m.prop();
        const subscribersDetails = m.prop({});
        l.load().then((subData) => {
            subscribersDetails(subData);
            const sortedGoals = _.sortBy(goals(), g => g().value()),
                nextGoal = _.find(sortedGoals, goal => goal().value() > subscribersDetails().amount_paid_for_valid_period);
            currentGoal(nextGoal());
        });
        const showSuccess = m.prop(false);
        const error = m.prop(false);

        projectGoalsVM.fetchGoalsEdit(args.projectId);

        if (railsErrorsVM.railsErrors()) {
            railsErrorsVM.mapRailsErrors(railsErrorsVM.railsErrors(), mapErrors, e);
        }
        return {
            showSuccess,
            e,
            error,
            goals,
            currentGoal,
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
                        ctrl.e.inlineError('goals'),
                        m('div',
                            m(".card.card-terciary.medium.u-marginbottom-30[id='arrecadacao']", [
                                m('.u-marginbottom-30', [
                                    m("label.fontsize-base.fontweight-semibold[for='name-8']",
                                        'O que você vai alcançar com os pagamentos mensais de seus assinantes?'
                                    ),
                                    m('.fontsize-small', [
                                        'As metas mensais são a melhor maneira de informar aos seus assinantes o que você fará com os recursos arrecadados mensalmente em sua campanha. Use-as para mostrar, de forma clara, o que vocês estarão conquistando',
                                        m.trust('&nbsp;'),
                                        'juntos com o sucesso de seu Catarse Assinaturas.'
                                    ])
                                ]),
                                _.map(ctrl.goals(), (goal) => {
                                    if (goal().editing()) {
                                        return m(projectGoalEditCard, {
                                            goal,
                                            showSuccess,
                                            project: args.project,
                                            currentGoal: ctrl.currentGoal,
                                            error
                                        });
                                    }
                                    return m(projectGoalCard, {
                                        goal,
                                        project: args.project,
                                        currentGoal: ctrl.currentGoal
                                    });
                                }),
                                m('button.btn.btn-large.btn-message', {
                                    onclick: () => {
                                        ctrl.addGoal(args.projectId);
                                    }
                                }, [
                                    '+ ',
                                    m.trust('&nbsp;'),
                                    ' Adicionar meta mensal'
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
