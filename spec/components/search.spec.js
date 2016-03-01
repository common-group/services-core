describe('Search', () => {
    let $output,
        c = window.c,
        Search = c.Search,
        action = '/test',
        method = 'POST';

    describe('view', () => {
        beforeEach(() => {
            $output = mq(Search.view({}, {action: action, method: method}));
        });

        it('should render the search form', () => {
            expect($output.find('form').length).toEqual(1);
            expect($output.find('input[type="text"]').length).toEqual(1);
            expect($output.find('button').length).toEqual(1);
        });
        it('should set the given action', () => {
            expect($output.find(`form[action="${action}"]`).length).toEqual(1);
        });
        it('should set the given method', () => {
            expect($output.find(`form[method="${method}"]`).length).toEqual(1);
        });
    });
});
