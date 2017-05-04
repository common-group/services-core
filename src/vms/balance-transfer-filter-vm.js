import m from 'mithril';
import postgrest from 'mithril-postgrest';
import replaceDiacritics from 'replaceDiacritics';
import h from '../h';

const vm = postgrest.filtersVM({
    full_text_index: '@@',
    state: 'eq',
    transfer_id: 'eq',
    created_at: 'eq',
    authorized_at: 'eq'
});

vm.state('');
vm.transfer_id('');
vm.created_at('');
vm.authorized_at('');

export default vm;
