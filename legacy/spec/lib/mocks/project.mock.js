beforeAll(function(){
  ProjectMockery = function(attrs){
    var attrs = attrs || {};
    var data = {
      project_id: 6051,
      project_name: 'foo',
      headline: 'foo',
      permalink: 'foo',
      state: "online",
      online_date: "2015-07-13T10:19:40.193106-03:00",
      recommended: 'true',
      project_img: 'http://foo.com/foo.jpg',
      remaining_time: {
        unit: 'days',
        total: '10'
      },
      elapsed_time: {
        unit: 'days',
        total: '0'
      },
      expires_at: "2015-09-12T02:59:59",
      pledged: 5220.0,
      progress: 41,
      state_acronym: 'SP',
      owner_name: 'foo',
      city_name: 'bar'
    };

    data = _.extend(data, attrs);
    return [data];
  };

  jasmine.Ajax.stubRequest(new RegExp("("+apiPrefix + '\/projects)'+'(.*)')).andReturn({
    'responseText' : JSON.stringify(ProjectMockery())
  });
});



