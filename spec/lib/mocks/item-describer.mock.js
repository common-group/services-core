beforeAll(function(){
  ItemDescriberMock = function(){
    //TO-DO: Implement opts to build custom describers
    return [
      {
        type: 'user',
        wrapperClass: '.w-col.w-col-4'
      },
      {
        type: 'project',
        wrapperClass: '.w-col.w-col-4'
      },
      {
        type: 'contribution',
        wrapperClass: '.w-col.w-col-2'
      },
      {
        type: 'payment',
        wrapperClass: '.w-col.w-col-2'
      }
    ];
  };
});
