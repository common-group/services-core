import m from 'mithril';
import postgrest from 'mithril-postgrest';
import adminInputAction from '../../src/c/admin-input-action';

describe('adminInputAction', () => {
    let testModel = postgrest.model('test'),
        item = {
            testKey: 'foo'
        },
        forced = null,
        ctrl, $output;

    let args = {
        property: 'testKey',
        updateKey: 'updateKey',
        callToAction: 'cta',
        innerLabel: 'inner',
        outerLabel: 'outer',
        placeholder: 'place',
        model: testModel
    };

    describe('controller', () => {
        beforeAll(() => {
            ctrl = adminInputAction.controller({
                data: args,
                item: item
            });
        });

        it('should instantiate a submit function', () => {
            expect(ctrl.submit).toBeFunction();
        });
        it('should return a toggler prop', () => {
            expect(ctrl.toggler).toBeFunction();
        });
        it('should return a value property to bind to', () => {
            expect(ctrl.newValue).toBeFunction();
        });

        describe('when forceValue is set', () => {
            beforeAll(() => {
                args.forceValue = forced;
                ctrl = adminInputAction.controller({
                    data: args,
                    item: item
                });
            });

            it('should initialize newValue with forced value', () => {
                expect(ctrl.newValue()).toEqual(forced);
            });

            afterAll(() => {
                delete args.forceValue;
            });
        });

    });

    describe('view', () => {
        beforeEach(() => {
            $output = mq(adminInputAction, {
                data: args,
                item: item
            });
        });

        it('shoud render the outerLabel on first render', () => {
            expect($output.contains(args.outerLabel)).toBeTrue();
            expect($output.contains(args.innerLabel)).toBeFalse();
            expect($output.contains(args.placeholder)).toBeFalse();
            expect($output.contains(args.callToAction)).toBeFalse();
        });

        describe('on button click', () => {
            beforeEach(() => {
                $output.click('button');
            });

            it('should render an inner label', () => {
                expect($output.contains(args.innerLabel)).toBeTrue();
            });
            it('should render a placeholder', () => {
                expect($output.has('input[placeholder="' + args.placeholder + '"]')).toBeTrue();
            });
            it('should render a call to action', () => {
                expect($output.first('input[type="submit"]').attrs.value).toEqual(args.callToAction);
            });

            describe('when forceValue is set', () => {
                beforeAll(() => {
                    args.forceValue = forced;
                    ctrl = adminInputAction.controller({
                        data: args,
                        item: item
                    });
                });

                it('should initialize newValue with forced value', () => {
                    expect(ctrl.newValue()).toEqual(forced);
                });

                afterAll(() => {
                    delete args.forceValue;
                });
            });
        });

        describe('on form submit', () => {
            beforeAll(() => {
                spyOn(m, 'request').and.returnValue({
                    then: function(callback) {
                        callback([{
                            test: true
                        }]);
                    }
                });
            });
            beforeEach(() => {
                $output.click('button');
            });

            it('should call a submit function on form submit', () => {
                $output.trigger('form', 'submit');
                expect(m.request).toHaveBeenCalled();
            });
        });
    });
});
