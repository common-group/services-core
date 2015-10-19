describe('AdminExternalAction', function() {
    var c = window.c,
        m = window.m,
        models = window.c.models,
        AdminExternalAction = c.AdminExternalAction,
        testModel = m.postgrest.model('reloadAction'),
        item = {
            testKey: 'foo'
        },
        ctrl, $output;

    var args = {
        updateKey: 'updateKey',
        callToAction: 'cta',
        innerLabel: 'inner',
        outerLabel: 'outer',
        model: testModel,
        requestOptions: {
            url: 'http://external_api'
        }
    };

    describe('view', function() {
        beforeAll(function() {
            jasmine.Ajax.stubRequest(args.requestOptions.url).andReturn({
                'responseText': JSON.stringify([])
            });
        });

        beforeEach(function() {
            $output = mq(AdminExternalAction, {
                data: args,
                item: item
            });
        });

        it('shoud render the outerLabel on first render', function() {
            expect($output.contains(args.outerLabel)).toBeTrue();
            expect($output.contains(args.innerLabel)).toBeFalse();
            expect($output.contains(args.placeholder)).toBeFalse();
            expect($output.contains(args.callToAction)).toBeFalse();
        });

        describe('on button click', function() {
            beforeEach(function() {
                $output.click('button');
            });

            it('should render an inner label', function() {
                expect($output.contains(args.innerLabel)).toBeTrue();
            });

            it('should render a call to action', function() {
                expect($output.first('input[type="submit"]').attrs.value).toEqual(args.callToAction);
            });

        });

        describe('on form submit', function() {
            beforeEach(function() {
                $output.click('button');
            });

            it('should call a submit function on form submit', function() {
                $output.trigger('form', 'submit');
                const lastRequest = jasmine.Ajax.requests.mostRecent();
                expect(lastRequest.url).toEqual('https://api.catarse.me/reloadAction');
            });
        });
    });
});