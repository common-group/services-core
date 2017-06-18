import h from '../h';

const dashboardQuestions = m.prop([{
    id: 1,
    type: 'open',
    question: '',
    description: '',
    toggleDropdown: h.toggleProp(false, true)
}]);

const updateIfQuestion = questionToUpdate => question => {
    if (question.id === questionToUpdate.id) {
        return questionToUpdate;
    }

    return question;
};

const updateDashboardQuestion = questionToUpdate => _.compose(dashboardQuestions,
    _.map(dashboardQuestions(), updateIfQuestion(questionToUpdate))
);

const surveyVM = {
    dashboardQuestions,
    updateDashboardQuestion
};

export default surveyVM;