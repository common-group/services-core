describe('Search', () => {
    let $output,
        c = window.c,
        Search = c.Search;

    describe('view', () => {
        beforeEach(() => {
            $output = mq(Search.view());
        });
        
        it('should render the search form', () => {
            expect($output.find('form').length).toEqual(1);
            expect($output.find('input[type="text"]').length).toEqual(1);
            expect($output.find('button').length).toEqual(1);
        });
    });
});
