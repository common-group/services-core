describe('AonAdminProjectDetailsExplanation', () => {
    let AonAdminProjectDetailsExplanation = window.c.AonAdminProjectDetailsExplanation,
        $output;
    let outputForState = (currentState) => {
        let projectDetail = ProjectDetailsMockery({
            state: currentState
        })[0];
        let component = m.component(AonAdminProjectDetailsExplanation, {
            resource: projectDetail
        });
        let view = component.view(component.controller, {
            resource: projectDetail
        });
        return mq(view);
    };

    describe('view', () => {
        it('should render state text for online', () => {
            $output = outputForState('online');
            expect($output.find('.online-project-text').length).toEqual(1);
        });

        it('should render state text for oa approved', () => {
            $output = outputForState('approved');
            expect($output.find('.approved-project-text').length).toEqual(1);
        });

        it('should render state text for draft', () => {
            $output = outputForState('draft');
            expect($output.find('.draft-project-text').length).toEqual(1);
        });

        it('should render state text for waiting_funds', () => {
            $output = outputForState('waiting_funds');
            expect($output.find('.waiting_funds-project-text').length).toEqual(1);
        });

        it('should render state text for successful', () => {
            $output = outputForState('successful');
            expect($output.find('.successful-project-text').length).toEqual(1);
        });

        it('should render state text for failed', () => {
            $output = outputForState('failed');
            expect($output.find('.failed-project-text').length).toEqual(1);
        });

        it('should render state text for rejected', () => {
            $output = outputForState('rejected');
            expect($output.find('.rejected-project-text').length).toEqual(1);
        });
    });
});
