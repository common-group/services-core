window.c.UserCard = (function(m, _, models, h) {
    return {
        controller: function(args) {
            var vm = h.idVM,
                userDetails = m.prop([]);

            vm.id(args.userId);

            //FIXME: can call anon requests when token fails (requestMaybeWithToken)
            models.userDetail.getRowWithToken(vm.parameters()).then(userDetails);

            return {
                userDetails: userDetails
            };
        },
        view: function(ctrl) {
            return m('#user-card', _.map(ctrl.userDetails(), function(userDetail) {
                return m('.card.card-user.u-radius.u-marginbottom-30[itemprop="author"]', [
                    m('.w-row', [
                        m('.w-col.w-col-4.w.col-small-4.w-col-tiny-4.w-clearfix', [
                            m('img.thumb.u-round[width="100"][itemprop="image"][src="' + userDetail.profile_img_thumbnail + '"]')
                        ]),
                        m('.w-col.w-col-8.w-col-small-8.w-col-tiny-8', [
                            m('.fontsize-small.fontweight-semibold.lineheight-tighter[itemprop="name"]', [
                                m('a.link-hidden[href="/users/' + userDetail.id + '"]', userDetail.name)
                            ]),
                            m('.fontsize-smallest.lineheight-looser[itemprop="address"]', userDetail.address_city),
                            m('.fontsize-smallest', userDetail.total_published_projects + ' projetos criados'),
                            m('.fontsize-smallest', 'apoiou ' + userDetail.total_contributed_projects + ' projetos')
                        ]),
                    ]),
                    m('.project-author-contacts', [
                        m('ul.w-list-unstyled.fontsize-smaller.fontweight-semibold', [
                            (!_.isEmpty(userDetail.facebook_link) ? m('li', [
                                m('a.link-hidden[itemprop="url"][href="' + userDetail.facebook_link + '"][target="_blank"]', 'Perfil no Facebook')
                            ]) : ''), (!_.isEmpty(userDetail.twitter_username) ? m('li', [
                                m('a.link-hidden[itemprop="url"][href="https://twitter.com/' + userDetail.twitter_username + '"][target="_blank"]', 'Perfil no Twitter')
                            ]) : ''),
                            _.map(userDetail.links, function(link) {
                                return m('li', [
                                    m('a.link-hidden[itemprop="url"][href="' + link + '"][target="_blank"]', link)
                                ]);
                            })
                        ]),
                    ]), (!_.isEmpty(userDetail.email) ? m('a.btn.btn-medium.btn-message[href="mailto:' + userDetail.email + '"][itemprop="email"][target="_blank"]', 'Enviar mensagem') : '')
                ]);
            }));
        }
    };
}(window.m, window._, window.c.models, window.c.h));
