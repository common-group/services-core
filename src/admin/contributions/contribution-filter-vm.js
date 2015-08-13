window.c.admin.contributionFilterVM = (function(m, h, replaceDiacritics){
  var vm = m.postgrest.filtersVM({
    full_text_index: '@@',
    state: 'eq',
    gateway: 'eq',
    value: 'between',
    created_at: 'between'
  });

  // Set default values
  vm.state('');
  vm.gateway('');
  vm.order({id: 'desc'});

  vm.created_at.lte.toFilter = function(){
    return h.momentFromString(vm.created_at.lte()).endOf('day').format('');
  };

  vm.created_at.gte.toFilter = function(){
    return h.momentFromString(vm.created_at.gte()).format();
  };

  vm.full_text_index.toFilter = function(){
    return replaceDiacritics(vm.full_text_index());
  };

  return vm;
}(window.m, window.c.h, window.replaceDiacritics));
