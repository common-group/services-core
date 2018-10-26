import m from 'mithril';
import prop from 'mithril/stream';
import moment from 'moment';
import UserFollowBtn from './user-follow-btn';
import ownerMessageContent from './owner-message-content';
import modalBox from './modal-box';

const dashboardSubscriptionCardDetailUserProfile = {
    oninit: function(vnode)
    {
        return {};
    },
    view: function(ctrl, args)
    {
        const contactModalC = [ownerMessageContent, prop(args.user)];

        return m('.u-marginbottom-20.card.card-secondary.u-radius', [
            m('.fontsize-small.fontweight-semibold.u-marginbottom-10',
                'Perfil'
            ),
            m('.fontsize-smaller', [
                m('div',
                    args.subscription.user_email
                ),
                m('div',
                    `Conta no Catarse desde ${moment(args.user.created_at).format('MMMM YYYY')}`
                ),
                m('.u-marginbottom-10', [
                    `Apoiou ${args.user.total_contributed_projects} projetos `,
                    m.trust('&nbsp;'),
                    '| ',
                    m.trust('&nbsp;'),
                    `Criou ${args.user.total_published_projects} projetos`
                ]),
                (args.displayModal() ? m(modalBox, {
                    displayModal: args.displayModal,
                    content: contactModalC
                }) : ''),
                (m('a.btn.btn-small.btn-inline.btn-edit.u-marginright-10.w-button', {
                    onclick: args.displayModal.toggle
                }, 'Enviar mensagem')),
                m(UserFollowBtn, {
                    follow_id: args.user.id,
                    following: args.user.following_this_user,
                    enabledClass: 'a.btn.btn-small.btn-inline.btn-terciary.w-button',
                    disabledClass: 'a.btn.btn-small.btn-inline.btn-terciary.w-button'
                })
            ])
        ]);
    }
};

export default dashboardSubscriptionCardDetailUserProfile;