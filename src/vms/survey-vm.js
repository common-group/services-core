import m from 'mithril';
import _ from 'underscore';
import h from '../h';

const openQuestionType = 'open',
    multipleQuestionType = 'multiple',
    newQuestion = () => ({
        type: openQuestionType,
        question: '',
        description: '',
        survey_question_choices_attributes: m.prop([]),
        toggleDropdown: h.toggleProp(false, true)
    });

const dashboardQuestions = m.prop([newQuestion()]);

const submitQuestions = rewardId => m.request({
    method: 'POST',
    url: `/rewards/${rewardId}/surveys`,
    data: {
        survey_open_questions_attributes: _.filter(dashboardQuestions(), { type: openQuestionType }),
        survey_multiple_choice_questions_attributes: _.filter(dashboardQuestions(), { type: multipleQuestionType })
    },
    config: h.setCsrfToken
});

const updateIfQuestion = questionToUpdate => (question, idx) => {
    if (idx === _.indexOf(dashboardQuestions(), questionToUpdate)) {
        return questionToUpdate;
    }

    return question;
};

const updateDashboardQuestion = questionToUpdate => _.compose(dashboardQuestions,
    _.map(dashboardQuestions(), updateIfQuestion(questionToUpdate))
);

const addDashboardQuestion = _.compose(dashboardQuestions, () => {
    dashboardQuestions().push(newQuestion());

    return dashboardQuestions();
});

const deleteDashboardQuestion = (question) => {
    dashboardQuestions(
        _.without(dashboardQuestions(), question)
    );
};

const addMultipleQuestionOption = (question) => {
    question.survey_question_choices_attributes().push({ option: '' });

    return false;
};

const deleteMultipleQuestionOption = (question, idx) => {
    question.survey_question_choices_attributes().splice(idx, 1);

    return false;
};

const surveyVM = {
    addDashboardQuestion,
    dashboardQuestions,
    deleteDashboardQuestion,
    updateDashboardQuestion,
    deleteMultipleQuestionOption,
    addMultipleQuestionOption,
    submitQuestions,
    openQuestionType,
    multipleQuestionType
};

export default surveyVM;
