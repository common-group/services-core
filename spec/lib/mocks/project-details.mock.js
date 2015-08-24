beforeAll(function(){
  ProjectDetailsMockery = function(attrs){
    var attrs = attrs || {};
    var data = {
      project_id: 6051,
      progress: 41,
      pledged: 5220.0,
      total_contributions: 160,
      state: "online",
      expires_at: "2015-09-12T02:59:59",
      online_date: "2015-07-13T10:19:40.193106-03:00",
      sent_to_analysis_at: "2014-07-01T23:01:05.640456",
      is_published: true,
      is_expired: false,
      open_for_contributions: true,
      reminder_count: 23,
      remaining_time: {total: 22, unit: "days"},
      user: {id: 123, name: "Lorem ipsum"},
      rewards: [
        {
          id: 25494, project_id: 6051, description: "3 livrinhos impressos (frete grátis)",
          minimum_value: 45.0, maximum_contributions: null, deliver_at: "2015-10-01T03:00:00",
          updated_at: "2015-07-13T14:27:54.030958", paid_count:16, waiting_payment_count:2
        }
      ]
    };

    data = _.extend(data, attrs);
    return [data];
  };

  jasmine.Ajax.stubRequest(new RegExp("("+apiPrefix + '\/project_details)'+'(.*)')).andReturn({
    'responseText' : JSON.stringify(ProjectDetailsMockery())
  });
});


