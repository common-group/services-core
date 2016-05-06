/*
 * UserFollowBtn - Component
 * Handles with follow / unfollow actions to an user
 *
 * Example:
 * m.component(c.UserFollowBtn, {follow_id: 10, following: false})
 */
window.c.UserFollowBtn = ((m, h, _, models) => {
    return {
        controller: (args) => {
            const following = m.prop((args.following||false)),
                  followVM = m.postgrest.filtersVM({follow_id: 'eq'}),
                  loading = m.prop(false),
                  userFollowInsert = models.userFollow.postOptions({
                      follow_id: args.follow_id}),
                  userFollowDelete = (() => {
                      followVM.follow_id(args.follow_id);

                      return models.userFollow.deleteOptions(
                          followVM.parameters());
                  }()),
                  follow = () => {
                      const l = m.postgrest.loaderWithToken(userFollowInsert);
                      loading(true);

                      l.load().then(() => {
                          following(true);
                          loading(false);
                      });
                  },
                  unfollow = () => {
                      const l = m.postgrest.loaderWithToken(userFollowDelete);
                      loading(true);

                      l.load().then(() => {
                          following(false);
                          loading(false);
                      });
                  };

            return {
                following: following,
                follow: follow,
                unfollow: unfollow,
                loading: loading
            };
        },
        view: (ctrl, args) => {
            if (ctrl.loading()) { return h.loader(); }
            if (ctrl.following()) {
                return m('a.w-button.btn.btn-medium.u-margintop-20',
                         {onclick: ctrl.unfollow},
                         'Deixar de seguir');
            } else {
                return m('a.w-button.btn.btn-medium.btn-terciary.u-margintop-20',
                         {onclick: ctrl.follow},
                         'Seguir');
            }
        }
    };
}(window.m, window.c.h, window._, window.c.models));
