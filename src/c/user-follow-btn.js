/*
 * UserFollowBtn - Component
 * Handles with follow / unfollow actions to an user
 *
 * Example:
 * m.component(c.UserFollowBtn, {follow_id: 10, following: false})
 */

import m from 'mithril';
import postgrest from 'mithril-postgrest';
import h from '../h';
import models from '../models';


const UserFollowBtn = {
    controller(args) {
        const following = m.prop((args.following||false)),
              followVM = postgrest.filtersVM({follow_id: 'eq'}),
              loading = m.prop(false),
              hover = m.prop(false),
              userFollowInsert = models.userFollow.postOptions({
                  follow_id: args.follow_id}),
              userFollowDelete = (() => {
                  followVM.follow_id(args.follow_id);

                  return models.userFollow.deleteOptions(
                      followVM.parameters());
              })(),
              follow = () => {
                  const l = postgrest.loaderWithToken(userFollowInsert);
                  loading(true);

                  l.load().then(() => {
                      following(true);
                      loading(false);
                  });
              },
              unfollow = () => {
                  const l = postgrest.loaderWithToken(userFollowDelete);
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
            loading: loading,
            hover: hover
        };
    },
    view(ctrl, args) {
        if (ctrl.loading()) { return h.loader(); }
        if (ctrl.following()) {
            return m('a.w-button.btn.btn-medium.u-margintop-20',
                     {
                         onclick: ctrl.unfollow,
                         onmouseover: () => ctrl.hover(true),
                         onmouseout: () => ctrl.hover(false)
                     },
                     (ctrl.hover() ? 'Deixar de seguir' : 'Seguindo'));
        } else {
            return m('a.w-button.btn.btn-medium.btn-terciary.u-margintop-20',
                     {onclick: ctrl.follow},
                     'Seguir');
        }
    }
};


export default UserFollowBtn;
