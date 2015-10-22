describe('AdminFilter', () => {
    let ctrl, submit, fakeForm,
        formDesc, filterDescriber,
        $output,
        c = window.c,
        vm = c.admin.contributionFilterVM,
        AdminFilter = c.AdminFilter;

    describe('controller', () => {
        beforeAll(() => {
            ctrl = AdminFilter.controller();
        });

        it('should instantiate a toggler', () => {
            expect(ctrl.toggler).toBeDefined();
        });
    });

    describe('view', () => {
        beforeAll(() => {
            spyOn(m, 'component').and.callThrough();
            submit = jasmine.createSpy('submit');
            filterDescriber = FilterDescriberMock();
            $output = mq(AdminFilter, {
                filterBuilder: filterDescriber,
                data: {
                    label: 'foo'
                },
                submit: submit
            });
        });

        it('should render the main filter on render', () => {
            expect(m.component).toHaveBeenCalledWith(c.FilterMain, filterDescriber[0].data);
        });

        it('should build a form from a FormDescriber when clicking the advanced filter', function() {
            $output.click('button');
            //mithril.query calls component one time to build it, so calls.count = length + 1.
            expect(m.component.calls.count()).toEqual(filterDescriber.length + 1);
        });

        it('should trigger a submit function when submitting the form', function() {
            $output.trigger('form', 'submit');
            expect(submit).toHaveBeenCalled();
        });
    });
});