describe('AdminItem', function() {
    var c = window.c,
        AdminItem = c.AdminItem,
        item, $output, ListItemMock, ListDetailMock;

    beforeAll(function() {
        ListItemMock = {
            view: function(ctrl, args) {
                return m('.list-item-mock');
            }
        };
        ListDetailMock = {
            view: function(ctrl, args) {
                return m('.list-detail-mock');
            }
        };
    });

    describe('view', function() {
        beforeEach(function() {
            $output = mq(AdminItem, {
                listItem: ListItemMock,
                listDetail: ListDetailMock,
                item: item
            });
        });

        it('should render list item', function() {
            $output.should.have('.list-item-mock');
        });

        it('should render list detail when toggle details is true', function() {
            $output.click('button');
            $output.should.have('.list-detail-mock');
        });

        it('should not render list detail when toggle details is false', function() {
            $output.should.not.have('.list-detail-mock');
        });
    });

});