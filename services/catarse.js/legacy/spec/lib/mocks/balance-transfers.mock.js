beforeAll(function(){
    BalanceTransferMockery = function(attrs){
        var attrs = attrs || {};
        var data = {
            amount: 205,
            created_at: "2015-12-23T23:29:33.466779",
            id: 1,
            state: "pending",
            transfer_id: null,
            user_id: 1
        };

        data = _.extend(data, attrs);
        return [data];
    };

    jasmine.Ajax.stubRequest(new RegExp("("+apiPrefix + '\/balance_transfers)'+'(.*)')).andReturn({
        'responseText' : JSON.stringify(BalanceTransferMockery())
    });
});
