beforeAll(function() {
  CountriesMockery = function(attrs) {
    var data = [
      {
        id: 1,
        name: 'Argentina'
      },
      {
        id: 2,
        name: 'Brasil'
      }
    ];

    return data;
  };

  jasmine.Ajax.stubRequest(new RegExp("("+apiPrefix + '\/countries)'+'(.*)')).andReturn({
    'responseText' : JSON.stringify(CountriesMockery())
  });
});
