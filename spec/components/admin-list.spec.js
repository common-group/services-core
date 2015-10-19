describe('AdminList', () => {
    let c = window.c,
        AdminList = c.AdminList,
        $output, model, vm, ListItemMock, ListDetailMock,
        results = [{
            id: 1
        }],
        listParameters, endpoint;

    beforeAll(() => {
        endpoint = mockEndpoint('items', results);

        ListItemMock = {
            view: function(ctrl, args) {
                return m('.list-item-mock');
            }
        };
        ListDetailMock = {
            view: function(ctrl, args) {
                return m('');
            }
        };
        model = m.postgrest.model('items');
        vm = {
            list: m.postgrest.paginationVM(model),
            error: m.prop()
        };
        listParameters = {
            vm: vm,
            listItem: ListItemMock,
            listDetail: ListDetailMock
        };
    });

    describe('view', () => {
        describe('when not loading', () => {
            beforeEach(() => {
                spyOn(vm.list, "isLoading").and.returnValue(false);
                $output = mq(
                    AdminList,
                    listParameters
                );
            });

            it('should render fetched items', () => {
                expect($output.find('.card').length).toEqual(results.length);
            });

            it('should not show a loading icon', () => {
                $output.should.not.have('img[alt="Loader"]');
            });
        });

        describe('when loading', () => {
            beforeEach(() => {
                spyOn(vm.list, "isLoading").and.returnValue(true);
                $output = mq(
                    AdminList,
                    listParameters
                );
            });

            it('should render fetched items', () => {
                expect($output.find('.card').length).toEqual(results.length);
            });

            it('should show a loading icon', () => {
                $output.should.have('img[alt="Loader"]');
            });
        });

        describe('when error', () => {
            beforeEach(() => {
                vm.error('endpoint error');
                $output = mq(
                    AdminList,
                    listParameters
                );
            });

            it('should show an error info', () => {
                expect($output.has('.card-error')).toBeTrue();
            });
        });
    });
});