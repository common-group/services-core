import m from 'mithril';
import _ from 'underscore';
import h from '../h';
import ownerMessageContent from './owner-message-content';
import modalBox from './modal-box';

const projectUserCard = {
    controller(args) {
        return {displayModal: h.toggleProp(false, true)};
    },
    view(ctrl, args) {
        const project = args.project;
        const contactModalC = [ownerMessageContent, args.userDetails];
        const userDetail = args.userDetails();

        return m('#user-card', m('.u-marginbottom-30.u-text-center-small-only', [
                (ctrl.displayModal() ? m.component(modalBox, {
                    displayModal: ctrl.displayModal,
                    content: contactModalC
                }) : ''),
                m('.w-row', [
                    m('.w-col.w-col-4', [
                        m('img.thumb.u-marginbottom-30.u-round[width="100"][itemprop="image"][src="' + userDetail.profile_img_thumbnail + '"]')
                    ]),
                    m('.w-col.w-col-8', [
                        m('.fontsize-small.link-hidden.fontweight-semibold.u-marginbottom-10.lineheight-tight[itemprop="name"]', [
                            m('a.link-hidden[href="/users/' + userDetail.id + '"]',{onclick: h.analytics.event({cat: 'project_view',act: 'project_creator_link',lbl: userDetail.id,project: project()})}, userDetail.name)
                        ]),
                        m('.fontsize-smallest', [
                            h.pluralize(userDetail.total_published_projects, ' criado', ' criados'),
                            m.trust('&nbsp;&nbsp;|&nbsp;&nbsp;'),
                            h.pluralize(userDetail.total_contributed_projects, ' apoiado', ' apoiados')
                        ]),
                        m('ul.w-hidden-tiny.w-hidden-small.w-list-unstyled.fontsize-smaller.fontweight-semibold.u-margintop-20.u-marginbottom-20', [
                            (!_.isEmpty(userDetail.facebook_link) ? m('li', [
                                m('a.link-hidden[itemprop="url"][href="' + userDetail.facebook_link + '"][target="_blank"]',{onclick: h.analytics.event({cat: 'project_view',act: 'project_creator_fb',lbl: userDetail.facebook_link,project: project()})}, 'Perfil no Facebook')
                            ]) : ''), (!_.isEmpty(userDetail.twitter_username) ? m('li', [
                                m('a.link-hidden[itemprop="url"][href="https://twitter.com/' + userDetail.twitter_username + '"][target="_blank"]',{onclick: h.analytics.event({cat: 'project_view',act: 'project_creator_twitter',lbl: userDetail.twitter_username,project: project()})}, 'Perfil no Twitter')
                            ]) : ''),
                            _.map(userDetail.links, (link) => {
                                var parsedLink = h.parseUrl(link);

                                return (!_.isEmpty(parsedLink.hostname) ? m('li', [
                                    m('a.link-hidden[itemprop="url"][href="' + link + '"][target="_blank"]',{onclick: h.analytics.event({cat: 'project_view',act: 'project_creator_otherlinks',lbl: link,project: project()})}, parsedLink.hostname)
                                ]) : '');
                            })
                        ]),
                        (!_.isEmpty(userDetail) ? [m('a.w-button.btn.btn-terciary.btn-small.btn-inline[href=\'javascript:void(0);\']',{onclick: h.analytics.event({cat: 'project_view',act: 'project_creator_sendmsg',lbl: userDetail.id,project: project()}, ctrl.displayModal.toggle)}, 'Enviar mensagem')] : ''),
                        args.project().is_admin_role ?
                        m('p', userDetail.email) : ''
                    ]),
                ]),
            ])
        );
    }
};

export default projectUserCard;
