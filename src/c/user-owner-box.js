import m from 'mithril';
import h from '../h';

const UserOwnerBox = {
    view(ctrl, args) {
        let project = args.project,
            user = args.user;

        return m('.card.card-terciary.u-radius.u-marginbottom-40', [
            m('.w-row', [
                (args.hideAvatar ? '' : m('.w-col.w-col-2.w-col-small-2.w-col-tiny-2.w-hidden-tiny', [
                    m(`img.thumb.u-margintop-10.u-round[src="${h.useAvatarOrDefault(user.profile_img_thumbnail)}"][width="100"]`)
                ])),
                m('.w-col.w-col-10.w-col-small-10.w-col-tiny-10', [
                    m('.fontcolor-secondary.fontsize-smallest.u-marginbottom-10', [
                         (project ? 'Dados do apoiador ' : 'Dados do usuário '),
                        m(`a.alt-link[href="/not-my-account${project ? `?project_id=${project.project_id}` : ''}${args.reward ? `&reward_id=${args.reward.id}` : ''}${args.value ? `&value=${args.value}` : ''}"]`, 'Não é você?')
                    ]),
                    m('.fontsize-base.fontweight-semibold', user.name),
                    m('label.field-label', `CPF/CNPJ: ${user.owner_document}`)
                ])
            ])
        ]);
    }
};

export default UserOwnerBox;
