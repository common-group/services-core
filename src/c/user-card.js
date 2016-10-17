import m from 'mithril';
import _ from 'underscore';
import h from '../h';
import userVM from '../vms/user-vm';

const userCard = {
    controller(args) {
        const userDetails = m.prop({}),
            user_id = args.userId;

        userVM.fetchUser(user_id, true, userDetails);

        return {
            userDetails: userDetails
        };
    },
    view(ctrl) {
        const user = ctrl.userDetails(),
              profileImage = userVM.displayImage(user);
        return m('#user-card', m('.card.card-user.u-radius.u-marginbottom-30[itemprop=\'author\']',
            [
                m('.w-row',
                    [
                        m('.w-col.w-col-4.w.col-small-4.w-col-tiny-4.w-clearfix',
                            m(`img.thumb.u-round[itemprop=\'image\'][src=\'${profileImage}\'][width=\'100\']`)
                        ),
                        m('.w-col.w-col-8.w-col-small-8.w-col-tiny-8',
                            [
                                m('.fontsize-small.fontweight-semibold.lineheight-tighter[itemprop=\'name\']',
                                    m('a.link-hidden[href="/users/' + user.id + '"]', user.name)
                                ),
                                m('.fontsize-smallest.lineheight-looser[itemprop=\'address\']',
                                    user.address_city
                                ),
                                m('.fontsize-smallest',
                                    `${h.pluralize(user.total_published_projects, ' projeto', ' projetos')} criados`
                                ),
                                m('.fontsize-smallest',
                                    `apoiou ${h.pluralize(user.total_contributed_projects, ' projeto', ' projetos')}`
                                )
                            ]
                        )
                    ]
                ),
                m('.project-author-contacts', [
                    m('ul.w-list-unstyled.fontsize-smaller.fontweight-semibold', [
                        (!_.isEmpty(user.facebook_link) ? m('li', [
                            m('a.link-hidden[itemprop="url"][href="' + user.facebook_link + '"][target="_blank"]', 'Perfil no Facebook')
                        ]) : ''), (!_.isEmpty(user.twitter_username) ? m('li', [
                            m('a.link-hidden[itemprop="url"][href="https://twitter.com/' + user.twitter_username + '"][target="_blank"]', 'Perfil no Twitter')
                        ]) : ''),
                        _.map(user.links, (link) => {
                            return m('li', [
                                m('a.link-hidden[itemprop="url"][href="' + link + '"][target="_blank"]', link)
                            ]);
                        })
                    ]),
                ]), (!_.isEmpty(user.email) ? m('a.btn.btn-medium.btn-message[href="mailto:' + user.email + '"][itemprop="email"][target="_blank"]', 'Enviar mensagem') : '')
            ]
        ));
    }
};

export default userCard;
