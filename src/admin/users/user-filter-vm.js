window.c.admin.userFilterVM = (function(m, replaceDiacritics) {
    var vm = m.postgrest.filtersVM({
            full_text_index: '@@',
            deactivated_at: 'is.null'
        }),

        paramToString = function(p) {
            return (p || '').toString().trim();
        };

    // Set default values
    vm.deactivated_at(null).order({
        id: 'desc'
    });

    vm.deactivated_at.toFilter = function() {
        var filter = JSON.parse(vm.deactivated_at());
        return filter;
    };

    vm.full_text_index.toFilter = function() {
        var filter = paramToString(vm.full_text_index());
        return filter && replaceDiacritics(filter) || undefined;
    };

    return vm;
}(window.m, window.replaceDiacritics));
