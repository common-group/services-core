import m from 'mithril';
import _ from 'underscore';
import h from '../h';
import UserFollowBtn from './user-follow-btn';
import userVM from '../vms/user-vm';

const projectContributorCard = {
    controller: function(args) {
        const userDetails = m.prop({}),
            user_id = args.contribution.user_external_id;
        if (args.isSubscription) {
            userVM.fetchUser(user_id, true, userDetails).then(() => {
                args.contribution.data.profile_img_thumbnail = userDetails().profile_img_thumbnail;
                args.contribution.data.total_contributed_projects += userDetails().total_contributed_projects;
                args.contribution.data.total_published_projects += userDetails().total_published_projects;
            });
        }
        return {
            userDetails
        };
    },
    view: function(ctrl, args) {
        const contribution = args.contribution;

        return m('.card.card-backer.u-marginbottom-20.u-radius.u-text-center', [
            m(`a[href="/users/${contribution.user_id}"][style="display: block;"]`, {
                onclick: h.analytics.event({
                    cat: 'project_view',
                    act: 'project_backer_link',
                    lbl: contribution.user_id,
                    project: args.project()
                })
            }, [
                m(`img.thumb.u-marginbottom-10.u-round[src="${!_.isEmpty(contribution.data.profile_img_thumbnail) ? contribution.data.profile_img_thumbnail : '/assets/catarse_bootstrap/user.jpg'}"]`)
            ]),
            m(`a.fontsize-base.fontweight-semibold.lineheigh-tight.link-hidden-dark[href="/users/${contribution.user_id}"]`, {
                onclick: h.analytics.event({
                    cat: 'project_view',
                    act: 'project_backer_link',
                    lbl: contribution.user_id,
                    project: args.project()
                })
            }, userVM.displayName(contribution.data)),
            m('.fontcolor-secondary.fontsize-smallest.u-marginbottom-10', `${h.selfOrEmpty(contribution.data.city)}, ${h.selfOrEmpty(contribution.data.state)}`),
            m('.fontsize-smaller', [
                m('span.fontweight-semibold', contribution.data.total_contributed_projects), ' apoiados  |  ',
                m('span.fontweight-semibold', contribution.data.total_published_projects), ' criado'
            ]),
            m('.btn-bottom-card.w-row', [
                m('.w-col.w-col-3.w-col-small-4.w-col-tiny-3'),
                m('.w-col.w-col-6.w-col-small-4.w-col-tiny-6', [
                    m(UserFollowBtn, {
                        follow_id: contribution.user_id,
                        following: contribution.is_follow
                    })
                ]),
                m('.w-col.w-col-3.w-col-small-4.w-col-tiny-3')
            ])
        ]);
    }
};

export default projectContributorCard;
