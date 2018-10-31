import mq from 'mithril-query';
import m from 'mithril';
import projectSuccessfulOnboardProcessing from '../../src/c/project-successful-onboard-processing';
import projectSuccessfulOnboardEnabledWithdraw from '../../src/c/project-successful-onboard-enabled-withdraw';

describe('ProjectInsights', () => {
    let $outputWaitingFunds, $outputEnabledWithdraw, project;

    describe('view', () => {
        beforeAll(() => {
            project = ProjectMockery()[1];
            project.state = 'waiting_funds';
            $outputWaitingFunds = mq(m(projectSuccessfulOnboardProcessing, { project: m.prop(project), current_state: m.prop('waiting_funds') }));
            project.state = 'successful_waiting_transfer';
            $outputEnabledWithdraw = mq(m(projectSuccessfulOnboardEnabledWithdraw, { project: m.prop(project), current_state: m.prop('successful_waiting_transfer')  }));
        });

        it('Should show waiting funds onboard', () => {
            expect($outputWaitingFunds.contains(project.user.name)).toBeTrue();
        });

        it('Should show enabled withdraw onboard', () => {
            expect($outputEnabledWithdraw.find('span.fontweight-semibold').length).toEqual(2);
        });
    });
});