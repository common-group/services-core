import mq from 'mithril-query';
import m from 'mithril';
import projectRowWithHeader from '../../src/c/project-row-with-header'

describe('ProjectRowWithHeader', () => {
    var $output;

    describe('view', () => {
        let collection = {
            title: 'test collection',
            hash: 'testhash',
            collection: m.prop([]),
            loader: m.prop(false)
        };

        describe('when collection is empty and loader true', () => {
            beforeAll(() => {
                collection.collection([]);
                collection.loader(true);
                let component = m.component(projectRowWithHeader),
                    view = component.view(null, {
                        collection: collection
                    });
                $output = mq(view);
            });

            it('should render loader', () => {
                expect($output.find('img[alt="Loader"]').length).toEqual(1);
            });
        });

        describe('when collection is empty and loader false', () => {
            beforeAll(() => {
                collection.collection([]);
                collection.loader(false);
                let component = m.component(projectRowWithHeader),
                    view = component.view(null, {
                        collection: collection
                    });
                $output = mq(view);
            });

            it('should render nothing', () => {
                expect($output.find('img[alt="Loader"]').length).toEqual(0);
                expect($output.find('.w-section').length).toEqual(0);
            });
        });

        describe('when collection has projects', () => {
            beforeAll(() => {
                collection.collection(ProjectMockery());
                let component = m.component(projectRowWithHeader),
                    view = component.view(null, {
                        collection: collection
                    });
                $output = mq(view);
            });

            it('should render projects in row', () => {
                expect($output.find('.section.u-marginbottom-40').length).toEqual(1);
            });
        });

    });
});
