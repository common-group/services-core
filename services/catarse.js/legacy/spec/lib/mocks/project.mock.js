beforeAll(function(){
  ProjectMockery = function(attrs){
    var attrs = attrs || {};
    var data = [_.extend({
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
    }, attrs),
    {
      "project_id":14,
      "id":14,
      "user_id":3,
      "name":"QA1AON",
      "headline":"test",
      "budget":"<p>test\n</p>",
      "goal":123124.12,
      "about_html":"<p>test\n</p>",
      "permalink":"qa1aon_4727",
      "video_embed_url":null,
      "video_url":null,
      "category_name":"Mobilidade e Transporte",
      "category_id":1,
      "original_image":null,
      "thumb_image":null,
      "small_image":null,
      "large_image":null,
      "video_cover_image":null,
      "progress":0,
      "pledged":0,
      "total_contributions":0,
      "total_contributors":0,
      "state":"successful",
      "mode":"aon",
      "state_order":"finished",
      "expires_at":"2018-07-25T20:58:39.91553",
      "zone_expires_at":"2018-07-25T17:58:39.91553",
      "online_date":"2018-08-29T19:54:29.461845",
      "zone_online_date":"2018-08-29T16:54:29.461845",
      "sent_to_analysis_at":null,
      "is_published":true,
      "is_expired":true,
      "open_for_contributions":false,
      "online_days":60,
      "remaining_time":{
        "total" : 0, 
        "unit" : "seconds"
      },
      "elapsed_time":{
        "total" : 0, 
        "unit" : "seconds"
      },
      "posts_count":0,
      "address":{
        "city" : "fda", 
        "state_acronym" : "RS", 
        "state" : "Rio Grande do Sul"
      },
      "user":{
        "id" : 3, 
        "name" : "test test", 
        "public_name" : "Test1"
      },
      "reminder_count":0,
      "is_owner_or_admin":true,
      "user_signed_in":true,
      "in_reminder":false,
      "total_posts":0,
      "can_request_transfer":true,
      "is_admin_role":false,
      "contributed_by_friends":false,
      "admin_tag_list":null,
      "tag_list":null,
      "city_id":4,
      "admin_notes":null,
      "service_fee":null,
      "has_cancelation_request":false,
      "can_cancel":true,
      "tracker_snippet_html":"",
      "cover_image":null,
      "common_id":"9deafb36-6d86-48d5-900c-bf3c6b7e3e54"
    },
    {
      project_id: 6012,
      project_name: 'foo',
      headline: 'foo',
      permalink: 'foo',
      state: "online",
      mode: 'sub',
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
    }];

    return data;
  };

  jasmine.Ajax.stubRequest(new RegExp("("+apiPrefix + '\/projects)'+'(.*)')).andReturn({
    'responseText' : JSON.stringify(ProjectMockery())
  });
});



