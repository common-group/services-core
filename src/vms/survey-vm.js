import h from '../h';

const openQuestionType = 'open',
    multipleQuestionType = 'multiple',
    newQuestion = () => ({
        type: openQuestionType,
        question: '',
        description: '',
        options: m.prop(['']),
        toggleDropdown: h.toggleProp(false, true)
    });

const dashboardQuestions = m.prop([newQuestion()]);

const submitQuestions = (rewardId) => {
    return m.request({
        method: 'PUT',
        url: `/rewards/${rewardId}/surveys/questions`,
        data: {
            open_questions: _.filter(dashboardQuestions(), {type: openQuestionType}),
            multiple_choice_questions: _.filter(dashboardQuestions(), {type: multipleQuestionType})
        },
        config: h.setCsrfToken
    });
};

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
    question.options().push('');

    return false;
};

const deleteMultipleQuestionOption = (question, idx) => {
    question.options().splice(idx, 1);

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