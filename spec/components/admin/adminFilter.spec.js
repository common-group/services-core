describe('AdminFilter component', function() {
  var fakeForm = [
    {
      type: 'main',
      data: {
        vm: vm.full_text_index,
        placeholder: 'Busque por projeto, email, Ids do usuário e do apoio...'
      }
    },
    {
      type: 'dropdown',
      data:{
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
    {
      type: 'numberRange',
      data: {
        label: 'Valores entre',
        first: vm.value['gte'],
        last: vm.value['lte']
      }
    },
    {
      type: 'dateRange',
      data: {
        label: 'Período do apoio',
        first: vm.created_at['gte'],
        last: vm.created_at['lte']
      }
    }
  ];
  beforeAll(function(){
    var submit = jasmine.createSpy('submit');
  });


  describe('view', function(){
    beforeAll(function(){
      var AdminFilter = m.component(adminApp.AdminFilter,{ form: fakeForm, submit: submit });
    });

    it('should fetch a new list with parameters when clicking on filter', function(){
      pending('implementation');
    });

  });
});
