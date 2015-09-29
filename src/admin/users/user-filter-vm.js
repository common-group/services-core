window.c.admin.userFilterVM = (function(m){
  var vm = m.postgrest.filtersVM({
    name: 'like',
  }),

  paramToString = function(p){
    return (p || '').toString().trim();
  };

  // Set default values
  vm.name('');
  vm.order({id: 'desc'});

  return vm;
}(window.m));
