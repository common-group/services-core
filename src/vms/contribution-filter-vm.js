import m from 'mithril'
import h from '../h';
import postgrest from 'mithril-postgrest';
import replaceDiacritics from 'replaceDiacritics';

const vm = postgrest.filtersVM({
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

export default vm;
