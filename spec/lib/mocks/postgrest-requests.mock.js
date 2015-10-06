const testToken = "test_token";
const nContributions = 20;
const apiPrefix = "https://api.catarse.me";
m.postgrest.init(apiPrefix, {method: "GET", url: "/api_token"});

const mockEndpoint = function(endpoint, result){
  return jasmine.Ajax.stubRequest(
    new RegExp('(' + apiPrefix + '\/' + endpoint + ')(.*)')
  ).andReturn({
    'responseText' : JSON.stringify(result)
  });
};

beforeAll(function() {
  jasmine.Ajax.install();

  //API token stub
  jasmine.Ajax.stubRequest('/api_token').andReturn({
    'responseText' : '{"token": "' + testToken + '"}'
  });

  jasmine.Ajax.stubRequest('/test').andReturn({
    'responseText' : '{"object": "responseOK"}'
  });


});

afterAll(function() {
  jasmine.Ajax.uninstall();
});
