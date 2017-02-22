import m from 'mithril';
import categoryButton from '../../src/c/category-button';

describe('CategoryButton', () => {
    let $output,
        c = window.c;

    describe('view', () => {
        beforeAll(() => {
            $output = mq(m.component(categoryButton, {
                category: {
                    id: 1,
                    name: 'cat',
                    online_projects: 1
                }
            }));
        });

        it('should build a link with .btn-category', function() {
            expect($output.has('a.btn-category')).toBeTrue();
        });
        it('should build a link with external link', function() {
            expect($output.has(`a.btn-category[href="${window.I18n.translations.pt.projects.index.explore_categories[1]}"]`)).toBeTrue();
        });
    });
});
