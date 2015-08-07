beforeAll(function(){
  FormDescriberMock = function(opts){
    var form = [];
    //describes all possible form fields
    var describer = {
      main: {
        type: 'main',
        data: {
          vm: m.prop(),
          placeholder: 'Busque por projeto, email, Ids do usuário e do apoio...'
        }
      },
      dropdown: {
        type: 'dropdown',
        data: {
          label: 'Com o estado',
          name: 'state',
          vm: m.prop(),
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
      numberRange: {
        type: 'numberRange',
        data: {
          label: 'Valores entre',
          first: m.prop(),
          last: m.prop()
        }
      },
      dateRange: {
        type: 'dateRange',
        data: {
          label: 'Período do apoio',
          first: m.prop(),
          last: m.prop()
        }
      }
    };
    _.map(opts, function(opt){
      if(opt in describer){
        form.push(describer[opt]);
      }
    });

    return form;
  };
});
