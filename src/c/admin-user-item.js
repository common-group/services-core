window.c.AdminUserItem = (function(m, c, h) {
    return {
        view: function(ctrl, args) {
            return m(
                '.w-row', [
                    m('.w-col.w-col-4', [
                        m.component(c.AdminUser, args)
                    ])
                ]
            );
        }
    };
}(window.m, window.c, window.c.h));
