describe('FilterButton', () => {
    let $output,
        c = window.c;

    describe('view', () => {
        beforeAll(() => {
            $output = mq(m.component(c.FilterButton, {
                title: 'Test',
                href: 'test'
            }));
        });

        it('should build a link with .filters', function() {
            expect($output.has('a.filters')).toBeTrue();
        });
    });
});
