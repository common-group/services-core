import m from 'mithril';
import adminFilter from '../../src/c/admin-filter';
import filterMain from '../../src/c/filter-main';

describe('AdminFilter', () => {
    let ctrl, submit, fakeForm,
        formDesc, filterDescriber,
        $output;

    describe('controller', () => {
        beforeAll(() => {
            ctrl = adminFilter.controller();
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
            $output = mq(adminFilter, {
                filterBuilder: filterDescriber,
                data: {
                    label: 'foo'
                },
                submit: submit
            });
        });

        it('should render the main filter on render', () => {
            expect(m.component).toHaveBeenCalledWith(filterMain, filterDescriber[0].data);
        });

        it('should build a form from a FormDescriber when clicking the advanced filter', () => {
            $output.click('button');
            //mithril.query calls component one time to build it, so calls.count = length + 1.
            expect(m.component.calls.count()).toEqual(filterDescriber.length + 1);
        });

        it('should trigger a submit function when submitting the form', () => {
            $output.trigger('form', 'submit');
            expect(submit).toHaveBeenCalled();
        });
    });
});
