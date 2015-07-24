var vm = adminApp.AdminFilter.VM = m.postgrest.filtersVM({
  full_text_index: '@@',
  state: 'eq',
  gateway: 'eq',
  value: 'between',
  created_at: 'between'
});

// Set default values
vm.state('');
vm.gateway('');

vm.created_at.lte.toFilter = function(){
  return momentFromString(vm.created_at.lte()).endOf('day').format();
};

vm.created_at.gte.toFilter = function(){
  return momentFromString(vm.created_at.gte()).format();
};
