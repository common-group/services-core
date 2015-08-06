window.c.admin.ContributionFilterVM = (function(m, h, replaceDiacritics){
  var vm = m.postgrest.filtersVM({
    full_text_index: '@@',
    state: 'eq',
    gateway: 'eq',
    value: 'between',
    created_at: 'between'
  });

  // Form describer
  vm.formDescriber = [
    { //full_text_index
      type: 'main',
      data: {
        vm: vm.full_text_index,
        placeholder: 'Busque por projeto, email, Ids do usuário e do apoio...'
      }
    },
    { //state
      type: 'dropdown',
      data: {
        label: 'Com o estado',
        name: 'state',
        vm: vm.state,
        options: [
          {value: '', option: 'Qualquer um'},
          {value: 'paid', option: 'paid'},
          {value: 'refused', option: 'refused'},
          {value: 'pending', option: 'pending'},
          {value: 'pending_refund', option: 'pending_refund'},
          {value: 'refunded', option: 'refunded'},
          {value: 'chargeback', option: 'chargeback'},
          {value: 'deleted', option: 'deleted'}
        ]
      }
    },
    { //gateway
      type: 'dropdown',
      data: {
        label: 'gateway',
        name: 'gateway',
        vm: vm.gateway,
        options: [
          {value: '', option: 'Qualquer um'},
          {value: 'Pagarme', option: 'Pagarme'},
          {value: 'MoIP', option: 'MoIP'},
          {value: 'PayPal', option: 'PayPal'},
          {value: 'Credits', option: 'Créditos'}
        ]
      }
    },
    { //value
      type: 'numberRange',
      data: {
        label: 'Valores entre',
        first: vm.value.gte,
        last: vm.value.lte
      }
    },
    { //created_at
      type: 'dateRange',
      data: {
        label: 'Período do apoio',
        first: vm.created_at.gte,
        last: vm.created_at.lte
      }
    }
  ];

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
