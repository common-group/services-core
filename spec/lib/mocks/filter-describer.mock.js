beforeAll(function(){
  FilterDescriberMock = function(){
    var describer = [
      { //full_text_index
        component: 'FilterMain',
        data: {
          vm: m.prop(),
          placeholder: 'Busque por projeto, email, Ids do usuário e do apoio...'
        }
      },
      { //state
        component: 'FilterDropdown',
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
      { //gateway
        component: 'FilterDropdown',
        data: {
          label: 'gateway',
          name: 'gateway',
          vm: m.prop(),
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
        component: 'FilterNumberRange',
        data: {
          label: 'Valores entre',
          first: m.prop(),
          last: m.prop()
        }
      },
      { //created_at
        component: 'FilterDateRange',
        data: {
          label: 'Período do apoio',
          first: m.prop(),
          last: m.prop()
        }
      }
    ];

    return describer;
  };
});
