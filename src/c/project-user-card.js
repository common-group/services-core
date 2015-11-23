window.c.ProjectUserCard = ((m, _, h) => {
    return {
        view: (ctrl, args) => {
            return m('#user-card', _.map(args.userDetails(), (userDetail) => {
                return m('.u-marginbottom-30.u-text-center-small-only', [
                    m('.w-row', [
                        m('.w-col.w-col-4', [
                            m('img.thumb.u-marginbottom-30.u-round[width="100"][itemprop="image"][src="' + userDetail.profile_img_thumbnail + '"]')
                        ]),
                        m('.w-col.w-col-8', [
                            m('.fontsize-small.link-hidden.fontweight-semibold.u-marginbottom-10.lineheight-tight[itemprop="name"]', [
                                m('a.link-hidden[href="/users/' + userDetail.id + '"]', userDetail.name)
                            ]),
                            m('.fontsize-smallest', [
                                h.pluralize(userDetail.total_published_projects, ' criado', ' criados'),
                                m.trust('&nbsp;&nbsp;|&nbsp;&nbsp;'),
                                h.pluralize(userDetail.total_contributed_projects, ' apoiado', ' apoiados')
                            ]),
                            m('ul.w-hidden-tiny.w-hidden-small.w-list-unstyled.fontsize-smaller.fontweight-semibold.u-margintop-20.u-marginbottom-20', [
                                (!_.isEmpty(userDetail.facebook_link) ? m('li', [
                                    m('a.link-hidden[itemprop="url"][href="' + userDetail.facebook_link + '"][target="_blank"]', 'Perfil no Facebook')
                                ]) : ''), (!_.isEmpty(userDetail.twitter_username) ? m('li', [
                                    m('a.link-hidden[itemprop="url"][href="https://twitter.com/' + userDetail.twitter_username + '"][target="_blank"]', 'Perfil no Twitter')
                                ]) : ''),
                                _.map(userDetail.links, (link) => {
                                    var parsedLink = h.parseUrl(link);

                                    return (!_.isEmpty(parsedLink.hostname) ? m('li', [
                                        m('a.link-hidden[itemprop="url"][href="' + link + '"][target="_blank"]', parsedLink.hostname)
                                    ]) : '');
                                })
                            ]), (!_.isEmpty(userDetail.email) ? m('.w-hidden-small.w-hidden-tiny.fontsize-smallest.alt-link.fontweight-semibold[itemprop="email"][target="_blank"]', userDetail.email) : '')
                        ]),
                    ]),
                ]);
            }));
        }
    };
}(window.m, window._, window.c.h));
