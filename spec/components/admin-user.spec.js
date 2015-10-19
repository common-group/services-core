describe('AdminUser', function() {
    var c = window.c,
        AdminUser = c.AdminUser,
        item, $output;

    describe('view', function() {
        beforeAll(function() {
            item = ContributionDetailMockery(1)[0];
            $output = mq(AdminUser.view(null, {
                item: item
            }));
        });

        it('should build an item from an item describer', function() {
            expect($output.has('.user-avatar')).toBeTrue();
            expect($output.contains(item.email)).toBeTrue();
        });
    });

});