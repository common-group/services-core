import m from 'mithril';
import projectSuccessfulOnboardConfirmAccountError from '../../src/c/project-successful-onboard-confirm-account-error';

describe('Project Successful Onboard Account Error', () => {
    let $output, changeActionFn, addErrorReasonFn;

    describe('view', () => {
        beforeAll(() => {
            changeActionFn = jasmine.createSpy('change-action');
            addErrorReasonFn = jasmine.createSpy('error-reason');

            let component = m.component(projectSuccessfulOnboardConfirmAccountError, {
                changeToAction: () => changeActionFn,
                addErrorReason: () => addErrorReasonFn
            });

            $output = mq(component);
        });

        it('should render a form', () => {
            expect($output.find('#successful-onboard-error').length).toEqual(1);
        });

        it('should call the error reason action on form submit', () => {
            $output.click('.w-button.btn.btn-medium');
            expect(addErrorReasonFn).toHaveBeenCalled();
        });

        it('should get back to action start when close is clicked', () => {
            $output.click('.fa-close');
            expect(changeActionFn).toHaveBeenCalled();
        });
    });
});
