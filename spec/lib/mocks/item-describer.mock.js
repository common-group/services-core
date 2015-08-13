beforeAll(function(){
  ItemDescriberMock = function(){
    //TO-DO: Implement opts to build custom describers
    return [
      {
        component: 'AdminUser',
        wrapperClass: '.w-col.w-col-4'
      },
      {
        component: 'AdminProject',
        wrapperClass: '.w-col.w-col-4'
      },
      {
        component: 'AdminContribution',
        wrapperClass: '.w-col.w-col-2'
      },
      {
        component: 'PaymentStatus',
        wrapperClass: '.w-col.w-col-2'
      }
    ];
  };
});
