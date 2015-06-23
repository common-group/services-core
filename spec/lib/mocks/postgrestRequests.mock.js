var test_token = "test_token";
var n_contributions = 20;

beforeAll(function() {
  jasmine.Ajax.install();
  //API token stub
  jasmine.Ajax.stubRequest('/api_token').andReturn({
    'responseText' : '{"token": "'+test_token+'"}'
  });

  //mocking postgrest requests
  m.postgrest.requestWithToken = function(data){
    var dfr = m.deferred();
    setTimeout(function(){
      if(data.method === "GET" && data.url === "/contribution_details"){
        dfr.resolve(ContributionDetailMockery(n_contributions));
      }
    },20);
    return dfr.promise;
  };
});

afterAll(function() {
  jasmine.Ajax.uninstall();
});