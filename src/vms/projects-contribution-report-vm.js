import m from 'mithril';
import replaceDiacritics from 'replaceDiacritics';
import h from '../h';

const vm = postgrest.filtersVM({
    full_text_index: '@@',
    state: 'in',
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

vm.withNullParameters = () => {
    const withNullVm = postgrest.filtersVM({
        full_text_index: '@@',
        state: 'in',
        reward_id: 'is',
        project_id: 'eq'
    });

    withNullVm.full_text_index(vm.full_text_index());
    withNullVm.order(vm.order());
    withNullVm.state(vm.state());
    withNullVm.reward_id(vm.reward_id());
    withNullVm.project_id(vm.project_id());

    return withNullVm.parameters();
};

export default vm;
