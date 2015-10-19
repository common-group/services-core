describe('ProjectRow', () => {
    var $output,
        ProjectRow = window.c.ProjectRow;

    describe('view', () => {
        let collection = {
            title: 'test collection',
            hash: 'testhash',
            collection: m.prop([])
        };

        describe('when we have a ref parameter', () => {
            it('should not render row', () => {
                let [project] = ProjectMockery();
                collection.collection([project]);
                let component = m.component(ProjectRow),
                    view = component.view(null, {
                        collection: collection,
                        ref: 'ref_test'
                    });
                $output = mq(view);
                expect($output.find('.card-project a[href="/' + project.permalink + '?ref=ref_test"]').length).toEqual(3);
            });
        });

        describe('when collection is empty', () => {
            beforeAll(() => {
                collection.collection([]);
                let component = m.component(ProjectRow),
                    view = component.view(null, {
                        collection: collection
                    });
                $output = mq(view);
            });

            it('should not render row', () => {
                expect($output.find('.w-section').length).toEqual(0);
            });
        });

        describe('when collection has projects', () => {
            beforeAll(() => {
                collection.collection(ProjectMockery());
                let component = m.component(ProjectRow),
                    view = component.view(null, {
                        collection: collection
                    });
                $output = mq(view);
            });

            it('should render projects in row', () => {
                expect($output.find('.w-section').length).toEqual(1);
            });
        });

    });
});