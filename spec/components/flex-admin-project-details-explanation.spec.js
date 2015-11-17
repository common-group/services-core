describe('FlexAdminProjectDetailsExplanation', () => {
    let FlexAdminProjectDetailsExplanation = window.c.FlexAdminProjectDetailsExplanation,
        $output;
    let outputForState = (currentState) => {
        let projectDetail = ProjectDetailsMockery({
            state: currentState
        })[0];
        let component = m.component(FlexAdminProjectDetailsExplanation, {
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

        it('should render state text for rejected', () => {
            $output = outputForState('rejected');
            expect($output.find('.rejected-project-text').length).toEqual(1);
        });
    });
});
