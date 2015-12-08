window.c.AdminUser = (function(m, h) {
    return {
        view: function(ctrl, args) {
            var user = args.item;
            return m('.w-row.admin-user', [
                m('.w-col.w-col-3.w-col-small-3.u-marginbottom-10', [
                    m('img.user-avatar[src="' + h.useAvatarOrDefault(user.profile_img_thumbnail) + '"]')
                ]),
                m('.w-col.w-col-9.w-col-small-9', [
                    m('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-10', [
                        m('a.alt-link[target="_blank"][href="/users/' + user.id + '/edit"]', user.name || user.email)
                    ]),
                    m('.fontsize-smallest', 'Usuário: ' + user.id),
                    m('.fontsize-smallest.fontcolor-secondary', 'Email: ' + user.email),
                    args.additional_data || m('')
                ])
            ]);
        }
    };
}(window.m, window.c.h));
