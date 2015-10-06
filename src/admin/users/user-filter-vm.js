window.c.admin.userFilterVM = (function(m, replaceDiacritics){
  var vm = m.postgrest.filtersVM({
    full_text_index: '@@'
  }),

  paramToString = function(p){
    return (p || '').toString().trim();
  };

  // Set default values
  vm.order({id: 'desc'});

  vm.full_text_index.toFilter = function(){
    var filter = paramToString(vm.full_text_index());
    return filter && replaceDiacritics(filter) || undefined;
  };

  return vm;
}(window.m, window.replaceDiacritics));
