window.c.AdminUser = (function(m, h){
  return {
    view: function(ctrl, args) {
      //TODO: So, one component with IFs or two duplicated components?
      var item = args.item;
      if (item.user) {
        var user = item.user;
        return m('.w-row.admin-user',[
          m('.w-col.w-col-3.w-col-small-3.u-marginbottom-10',[
            m('img.user-avatar[src="' + h.useAvatarOrDefault(user.profile_img_thumbnail) + '"]')
          ]),
          m('.w-col.w-col-9.w-col-small-9',[
            m('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-10', [
              m('a.alt-link[target="_blank"][href="/users/' + user.id + '/edit"]', user.name)
            ]),
            m('.fontsize-smallest', 'Usuário: ' + user.id),
            m('.fontsize-smallest.fontcolor-secondary', 'Email: ' + user.email)
          ])
        ]);
      } else {
        var user = item;
        return m('.w-row.admin-user',[
          m('.w-col.w-col-3.w-col-small-3.u-marginbottom-10',[
            m('img.user-avatar[src="' + h.useAvatarOrDefault(user.user_profile_img) + '"]')
          ]),
          m('.w-col.w-col-9.w-col-small-9',[
            m('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-10', [
              m('a.alt-link[target="_blank"][href="/users/' + user.user_id + '/edit"]', user.user_name)
            ]),
            m('.fontsize-smallest', 'Usuário: ' + user.user_id),
            m('.fontsize-smallest.fontcolor-secondary', 'Catarse: ' + user.email),
            m('.fontsize-smallest.fontcolor-secondary', 'Gateway: ' + user.payer_email)
          ])
        ]);
      }
    }
  };
}(window.m, window.c.h));
