import m from 'mithril';
import {
    commonPayment
} from '../api';
import replaceDiacritics from 'replaceDiacritics';
import h from '../h';

const vm = commonPayment.filtersVM({
        status: 'eq',
        full_text_index: '@@',
        payment_method: 'eq'
    }),

    paramToString = function(p) {
        return (p || '').toString().trim();
    };

// Set default values
vm.status('');
vm.payment_method('');
vm.order({
    id: 'desc'
});

vm.full_text_index.toFilter = function() {
    const filter = paramToString(vm.full_text_index());
    return filter && replaceDiacritics(filter) || undefined;
};

export default vm;
