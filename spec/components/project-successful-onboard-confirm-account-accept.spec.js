import m from 'mithril';
import projectSuccessfulOnboardConfirmAccountAccept from '../../src/c/project-successful-onboard-confirm-account-accept';

describe('Project Successful Onboard Account Accept', () => {
    let $output, changeActionFn, acceptAccountFn;

    describe('view', () => {
        beforeAll(() => {
            changeActionFn = jasmine.createSpy('change-action');
            acceptAccountFn = jasmine.createSpy('accept-account');

            let component = m.component(projectSuccessfulOnboardConfirmAccountAccept);

            $output = mq(component.view(null, {
                changeToAction: () => changeActionFn,
                acceptAccount: acceptAccountFn,
                acceptAccountLoader: m.prop(false)
            }));
        });

        it('should render a form', () => {
            expect($output.find('#successful-onboard-form').length).toEqual(1);
        });

        it('should call the accept account action on form submit', () => {
            $output.click('.w-button.btn.btn-medium');
            expect(acceptAccountFn).toHaveBeenCalled();
        });

        it('should get back to action start when close is clicked', () => {
            $output.click('.fa-close');
            expect(changeActionFn).toHaveBeenCalled();
        });
    });
});
