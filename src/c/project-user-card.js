import m from 'mithril';
import _ from 'underscore';
import h from '../h';
import ownerMessageContent from './owner-message-content';
import modalBox from './modal-box';
import UserFollowBtn from './user-follow-btn';
import userVM from '../vms/user-vm';

const projectUserCard = {
    controller(args) {
        const project = args.project || m.prop({}),
            displayModal = h.toggleProp(false, true),
            storeId = 'message',
            sendMessage = () => {
                if (!h.getUser()) {
                    h.storeAction(storeId, project().project_id);
                    return h.navigateToDevise(`?redirect_to=/projects/${project().project_id}`);
                }

                displayModal(true);
            };

        if (h.callStoredAction(storeId) == project().project_id) {
            displayModal(true);
        }

        return {
            displayModal,
            sendMessage
        };
    },
    view(ctrl, args) {
        const project = args.project;
        const contactModalC = [ownerMessageContent, m.prop(_.extend(args.userDetails(), {
            project_id: project().id
        }))];
        const userDetail = args.userDetails();

        return m('#user-card', _.isEmpty(userDetail) ? 'carregando...' : m('.u-marginbottom-30.u-text-center-small-only', [
            (ctrl.displayModal() ? m.component(modalBox, {
                displayModal: ctrl.displayModal,
                content: contactModalC
            }) : ''),
            m('.w-row', [
                m('.w-col.w-col-4', [
                    m(`img.thumb.u-marginbottom-30.u-round[width="100"][itemprop="image"][src="${userVM.displayImage(userDetail)}"]`)
                ]),
                m('.w-col.w-col-8', [
                    m('.fontsize-small.link-hidden.fontweight-semibold.u-marginbottom-10.lineheight-tight[itemprop="name"]', [
                        m(`a.link-hidden${args.isDark ? '.link-hidden-white' : ''}[href="${_.isNull(userDetail.deactivated_at) ? `/users/${userDetail.id}` : 'javascript:void(0);'}"]`, {
                            config: m.route,
                            onclick: () => {
                                if (!_.isNull(userDetail.deactivated_at)) {
                                    return false;
                                }
                                m.route(`/users/${userDetail.id}`, {
                                    user_id: userDetail.id
                                });
                                h.analytics.event({
                                    cat: 'project_view',
                                    act: 'project_creator_link',
                                    lbl: userDetail.id,
                                    project: project()
                                });
                            }
                        }, userVM.displayName(userDetail))
                    ]),
                    (!_.isNull(userDetail.deactivated_at) ? '' : m('.fontsize-smallest', [
                        h.pluralize(userDetail.total_published_projects, ' criado', ' criados'),
                        m.trust('&nbsp;&nbsp;|&nbsp;&nbsp;'),
                        h.pluralize(userDetail.total_contributed_projects, ' apoiado', ' apoiados')
                    ])),
                    (!_.isNull(userDetail.deactivated_at) ? '' : m('ul.w-hidden-tiny.w-hidden-small.w-list-unstyled.fontsize-smaller.fontweight-semibold.u-margintop-20.u-marginbottom-20', [
                        (!_.isEmpty(userDetail.facebook_link) ? m('li', [
                            m(`a.link-hidden${args.isDark ? '.link-hidden-white' : ''}[itemprop="url"][href="${userDetail.facebook_link}"][target="_blank"]`, {
                                onclick: h.analytics.event({
                                    cat: 'project_view',
                                    act: 'project_creator_fb',
                                    lbl: userDetail.facebook_link,
                                    project: project()
                                })
                            }, 'Perfil no Facebook')
                        ]) : ''), (!_.isEmpty(userDetail.twitter_username) ? m('li', [
                            m(`a.link-hidden${args.isDark ? '.link-hidden-white' : ''}[itemprop="url"][href="https://twitter.com/${userDetail.twitter_username}"][target="_blank"]`, {
                                onclick: h.analytics.event({
                                    cat: 'project_view',
                                    act: 'project_creator_twitter',
                                    lbl: userDetail.twitter_username,
                                    project: project()
                                })
                            }, 'Perfil no Twitter')
                        ]) : ''),
                        _.map(userDetail.links, (link) => {
                            const parsedLink = h.parseUrl(link.link);

                            return (!_.isEmpty(parsedLink.hostname) ? m('li', [
                                m(`a.link-hidden${args.isDark ? '.link-hidden-white' : ''}[itemprop="url"][href="${link.link}"][target="_blank"]`, {
                                    onclick: h.analytics.event({
                                        cat: 'project_view',
                                        act: 'project_creator_otherlinks',
                                        lbl: link.link,
                                        project: project()
                                    })
                                }, parsedLink.hostname)
                            ]) : '');
                        })
                    ])),
                    (!_.isEmpty(userDetail) ? [
                        (!_.isNull(userDetail.deactivated_at) ? '' : m(UserFollowBtn, {
                            enabledClass: `a.w-button.btn.btn-terciary${args.isDark ? '.btn-terciary-negative' : ''}.btn-small..u-marginbottom-10`,
                            disabledClass: `a.w-button.btn.btn-terciary${args.isDark ? '.btn-terciary-negative' : ''}.btn-small.u-marginbottom-10`,
                            follow_id: userDetail.id,
                            following: userDetail.following_this_user
                        })),
                        m(`a.w-button.btn.btn-terciary${args.isDark ? '.btn-terciary-negative' : ''}.btn-small[href=\'javascript:void(0);\']`, {
                            onclick: h.analytics.event({
                                cat: 'project_view',
                                act: 'project_creator_sendmsg',
                                lbl: userDetail.id,
                                project: project()
                            }, ctrl.sendMessage)
                        }, 'Contato')
                    ] : ''),
                    args.project().is_admin_role ?
                    m('p', userDetail.email) : ''
                ]),
            ]),
        ]));
    }
};

export default projectUserCard;
