import h from '../h';

const newQuestion = () => ({
    type: 'open',
    question: '',
    description: '',
    options: m.prop(['']),
    toggleDropdown: h.toggleProp(false, true)
});

const dashboardQuestions = m.prop([newQuestion()]);

const submitQuestions = () => {
    m.request({

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
    addMultipleQuestionOption
};

export default surveyVM;