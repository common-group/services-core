import m from 'mithril';
import _ from 'underscore';
import h from '../h';

const SignedFriendFacebookConnect = {
    controller(args) {
        const mapWithAvatar = () => {
            return _.filter(args.friendListVM.collection(), (item) => {
                return !_.isNull(item.avatar);
            });
        };

        return {
            mapWithAvatar: mapWithAvatar
        };
    },
    view(ctrl, args) {
        if(args.friendListVM.isLoading()) {
            return h.loader();
        } else {
            let total = args.friendListVM.total();
            return m('.w-section.section.bg-backs-carrosel.section-large', [
                m('.w-container', [
                    m('.card.card-big', [
                        m('.w-row', [
                            m('.w-col.w-col-8', [
                                m('.fontsize-largest.u-marginbottom-20', 'Descubra o que seus amigos estão apoiando'),
                                m('.fontsize-small', 'O universo do Catarse junto com a sua rede do Facebook te farão descobrir projetos incríveis!')
                            ]),
                            m('.w-col.w-col-4.u-text-center', [
                                m('.fontsize-smallest.u-marginbottom-10', `${total} dos seus amigos estão no Catarse!`),
                                m('.u-marginbottom-20', [
                                    _.shuffle(_.map(ctrl.mapWithAvatar(), (item) => {
                                        return m(`img.thumb.small.u-round.u-marginbottom-10[src="${item.avatar}"]`);
                                    })).slice(0, 8),
                                ]),
                                m('a.w-button.btn.btn-large[href="/follow-fb-friends"]', 'Procure seus amigos')
                            ])
                        ])
                    ])
                ])
            ]);
        }
    }
};

export default SignedFriendFacebookConnect;

