var vm = adminApp.AdminContributionsFilter.VM = m.postgrest.filtersVM({
  full_text_index: '@@',
  state: 'eq',
  gateway: 'eq',
  value: 'between',
  created_at: 'between'
});

// Set default values
vm.state('');
vm.gateway('Pagarme');
