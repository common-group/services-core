describe('CategoryButton', () => {
    let $output,
        c = window.c;

    describe('view', () => {
        beforeAll(() => {
            $output = mq(m.component(c.CategoryButton, {
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
    });
});
