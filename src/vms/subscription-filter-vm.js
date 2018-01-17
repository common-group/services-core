import m from 'mithril';
import {
    commonPayment
} from '../api';
import replaceDiacritics from 'replaceDiacritics';
import h from '../h';

const vm = commonPayment.filtersVM({
        status: 'eq',
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

export default vm;
