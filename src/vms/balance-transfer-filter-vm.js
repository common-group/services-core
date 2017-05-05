import m from 'mithril';
import postgrest from 'mithril-postgrest';
import replaceDiacritics from 'replaceDiacritics';
import h from '../h';
import models from '../models';

const vm = postgrest.filtersVM({
    full_text_index: '@@',
    state: 'eq',
    transfer_id: 'eq',
    created_date: 'eq',
    transferred_date: 'eq'
});

const paramToString = (p) => {
    return (p || '').toString().trim();
};

vm.state('');
vm.transfer_id('');
vm.created_date('');
vm.transferred_date('');

vm.created_date.toFilter = () => {
    const filter = paramToString(vm.created_date());
    return filter && h.momentFromString(filter).format('YYYY-MM-DD');
};

vm.transferred_date.toFilter = () => {
    const filter = paramToString(vm.transferred_date());
    return filter && h.momentFromString(filter).format('YYYY-MM-DD');
};

vm.getAllBalanceTransfers = (filterVM) => {
    models.balanceTransfer.pageSize(false);
    const allTransfers = postgrest.loaderWithToken(
        models.balanceTransfer.getPageOptions(filterVM.parameters())
    ).load();
    models.balanceTransfer.pageSize(9);
    return allTransfers;
};

export default vm;
