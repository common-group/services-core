import m from 'mithril';
import replaceDiacritics from 'replaceDiacritics';
import h from '../h';

const vm = postgrest.filtersVM({
    full_text_index: '@@',
    state: 'eq',
    reward_id: 'eq',
    project_id: 'eq'
}),
      paramToString = (p) => {
          return (p || '').toString().trim();
      };

vm.state('');
vm.order({
    id: 'desc'
});

vm.full_text_index.toFilter = () => {
    const filter = paramToString(vm.full_text_index());
    return filter && replaceDiacritics(filter) || undefined;
};

export default vm;
