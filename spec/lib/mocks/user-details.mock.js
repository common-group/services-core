beforeAll(function() {
  UserDetailMockery = function(attrs) {
    var attrs = attrs || {};
    var data = {
      id: 405699,
      user_id: 405699,
      name: 'Ryane Leão',
      address: {
        city: 'Sampa'
      },
      address_city: 'São Paulo',
      profile_img_thumbnail: 'https://s3.amazonaws.com/cdn.catarse/uploads/user/uploaded_image/405699/thumb_avatar_ryaneleao.jpg',
      profile_cover_image: 'https://s3.amazonaws.com/cdn.catarse/uploads/user/uploaded_image/405699/thumb_avatar_ryaneleao.jpg',
      facebook_link: 'https://www.facebook.com/ondejazzmeucoracao',
      full_text_index: null,
      twitter_username: '@rayaneleao',
      email: 'ryaneleao@gmail.com',
      total_contributed_projects: 2,
      total_published_projects: 1,
      about_html: 'about',
      created_at: '2014-12-01T02:00:00',
      is_owner_or_admin: false,
      links: null
    };

    data = _.extend(data, attrs);
    return [data];
  };

  jasmine.Ajax.stubRequest(new RegExp('('+apiPrefix + '\/user_details)'+'(.*)')).andReturn({
    'responseText' : JSON.stringify(UserDetailMockery())
  });
});
