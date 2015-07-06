var vm = adminApp.AdminContributionsFilter.VM = m.postgrest.filtersVM({
  search_text: 'ilike',
  state: 'eq',
  gateway: 'eq',
  value: 'between',
  created_at: 'between'
});

// Set default values
vm.state('pending');
vm.gateway('Pagarme');
