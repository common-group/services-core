window.c.admin.contributionFilterVM = (function(m, h, replaceDiacritics) {
    var vm = m.postgrest.filtersVM({
            full_text_index: '@@',
            state: 'eq',
            gateway: 'eq',
            value: 'between',
            created_at: 'between'
        }),

        paramToString = function(p) {
            return (p || '').toString().trim();
        };

    // Set default values
    vm.state('');
    vm.gateway('');
    vm.order({
        id: 'desc'
    });

    vm.created_at.lte.toFilter = function() {
        var filter = paramToString(vm.created_at.lte());
        return filter && h.momentFromString(filter).endOf('day').format('');
    };

    vm.created_at.gte.toFilter = function() {
        var filter = paramToString(vm.created_at.gte());
        return filter && h.momentFromString(filter).format();
    };

    vm.full_text_index.toFilter = function() {
        var filter = paramToString(vm.full_text_index());
        return filter && replaceDiacritics(filter) || undefined;
    };

    return vm;
}(window.m, window.c.h, window.replaceDiacritics));
