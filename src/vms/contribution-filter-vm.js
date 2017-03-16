import m from 'mithril';
import postgrest from 'mithril-postgrest';
import replaceDiacritics from 'replaceDiacritics';
import h from '../h';

const vm = postgrest.filtersVM({
        full_text_index: '@@',
        delivery_status: 'eq',
        state: 'eq',
        gateway: 'eq',
        value: 'between',
        created_at: 'between'
    }),

    paramToString = function (p) {
        return (p || '').toString().trim();
    };

// Set default values
vm.state('');
vm.delivery_status('');
vm.gateway('');
vm.order({
    id: 'desc'
});

vm.created_at.lte.toFilter = function () {
    const filter = paramToString(vm.created_at.lte());
    return filter && h.momentFromString(filter).endOf('day').format('');
};

vm.created_at.gte.toFilter = function () {
    const filter = paramToString(vm.created_at.gte());
    return filter && h.momentFromString(filter).format();
};

vm.full_text_index.toFilter = function () {
    const filter = paramToString(vm.full_text_index());
    return filter && replaceDiacritics(filter) || undefined;
};

export default vm;
