import m from 'mithril';
import _ from 'underscore';
import I18n from 'i18n-js';
import h from '../h';
import userVM from '../vms/user-vm';
import inlineError from './inline-error';

const I18nScope = _.partial(h.i18nScope, 'users.edit.notifications_fields');
const userNotifications = {
    controller(args) {
        const contributedProjects = m.prop(),
            projectReminders = m.prop(),
            mailMarketingLists = m.prop(),
            user_id = args.userId,
            showNotifications = h.toggleProp(false, true),
            error = m.prop(false);

        userVM.getUserProjectReminders(user_id).then(
            projectReminders
        ).catch((err) => {
            error(true);
            m.redraw();
        });

        userVM.getMailMarketingLists().then((data) => {
            mailMarketingLists(generateListHandler(data))
        }
        ).catch((err) => {
            error(true);
            m.redraw()
        });

        userVM.getUserContributedProjects(user_id, null).then(
            contributedProjects
        ).catch((err) => {
            error(true);
            m.redraw();
        });

        const generateListHandler = (list) => {
            const user_lists = args.user.mail_marketing_lists;
            return _.map(list, (item, i) => {
                let user_signed = !_.isEmpty(user_lists) && !_.isUndefined(_.find(user_lists, userList => {
                    return userList.marketing_list ? userList.marketing_list.list_id === item.list_id : false;
                }));
                let handler = {
                    item: item,
                    in_list: user_signed,
                    should_insert: m.prop(false),
                    should_destroy: m.prop(false),
                    isInsertInListState: h.toggleProp(false, true),
                    hovering: m.prop(false)
                };
                handler.isInsertInListState(!handler.in_list);
                return handler;
            });
        };

        const getUserMarketingListId = (list) => {
            const currentList = _.find(args.user.mail_marketing_lists, userList => userList.marketing_list.list_id === list.list_id);

            return currentList ? currentList['user_marketing_list_id'] : null;
        }

        const isOnCurrentList = (userLists, currentList) => {
            return Boolean(_.find(userLists, userList => {
                if (userList.marketing_list) {
                    return userList.marketing_list.list_id === currentList.list_id;
                }

                return false;
            }));
        };

        return {
            projects: contributedProjects,
            mailMarketingLists,
            showNotifications,
            projectReminders,
            error,
            generateListHandler,
            getUserMarketingListId,
            isOnCurrentList,
        };
    },
    view(ctrl, args) {
        const user = args.user,
            reminders = ctrl.projectReminders(),
            projects_collection = ctrl.projects(),
            marketing_lists = ctrl.mailMarketingLists();

        return m('[id=\'notifications-tab\']', ctrl.error() ? m.component(inlineError, {
            message: 'Erro ao carregar a página.'
        }) :
            m(`form.simple_form.edit_user[accept-charset='UTF-8'][action='/pt/users/${user.id}'][method='post'][novalidate='novalidate']`, [
                m('input[name=\'utf8\'][type=\'hidden\'][value=\'✓\']'),
                m('input[name=\'_method\'][type=\'hidden\'][value=\'patch\']'),
                m(`input[name='authenticity_token'][type='hidden'][value='${h.authenticityToken()}']`),
                m('input[id=\'anchor\'][name=\'anchor\'][type=\'hidden\'][value=\'notifications\']'),
                m('.w-container', [
                    m('.w-row',
                        m('.w-col.w-col-10.w-col-push-1',
                            m('.w-form.card.card-terciary', [
                                m('.w-row.u-marginbottom-20', [
                                    m('.w-col.w-col-4',
                                        m('.fontweight-semibold.fontsize-small.u-marginbottom-10',
                                            'Newsletters:'
                                        )
                                    ),
                                    m('.w-col.w-col-8', (_.isEmpty(marketing_lists) ? h.loader() : _.map(marketing_lists, (_item, i) => {
                                        const item = _item.item;

                                        return m('.card.u-marginbottom-20.u-radius.u-text-center-small-only',
                                            m('.w-row',
                                                [
                                                    m('.w-sub-col.w-col.w-col-6', 
                                                        m('img', {
                                                            src: I18n.t(`newsletters.${item.list_id}.image_src`, I18nScope())
                                                        })
                                                    ),
                                                    m('.w-col.w-col-6',
                                                        [   
                                                            m('.fontsize-base.fontweight-semibold', 
                                                                I18n.t(`newsletters.${item.list_id}.title`, I18nScope())
                                                            ),
                                                            m('.fontsize-small.u-marginbottom-30', 
                                                                I18n.t(`newsletters.${item.list_id}.description`, I18nScope())
                                                            ),
                                                            (_item.should_insert() || _item.should_destroy() ? m(`input[type='hidden']`, { name: `user[mail_marketing_users_attributes][${i}][mail_marketing_list_id]`, value: item.id }) : ''),
                                                            (_item.should_destroy() ? m(`input[type='hidden']`, { name: `user[mail_marketing_users_attributes][${i}][id]`, value: ctrl.getUserMarketingListId(item) }) : ''),
                                                            (_item.should_destroy() ? m(`input[type='hidden']`, { name: `user[mail_marketing_users_attributes][${i}][_destroy]`, value: _item.should_destroy() }) : ''),
                                                            m('button.btn.btn-medium.w-button',
                                                                {   
                                                                    class: !_item.isInsertInListState() ? 'btn-terciary' : null,
                                                                    onclick: (event) => {
                                                                        // If user already has this list, click should enable destroy state
                                                                        if(ctrl.isOnCurrentList(user.mail_marketing_lists, item)) {
                                                                            _item.should_destroy(true);

                                                                            return;
                                                                        }
                                                                        _item.should_insert(true);
                                                                    },
                                                                    onmouseenter: () => {
                                                                        _item.hovering(true);
                                                                    },
                                                                    onmouseout: () => {
                                                                        _item.hovering(false);
                                                                    }
                                                                }, 
                                                                _item.in_list ? _item.hovering() ? 'Descadastrar' : 'Assinado' : 'Assinar'
                                                            )
                                                        ]
                                                    )
                                                ]
                                            )
                                        );
                                    })))
                                ]),
                                m('.w-row.u-marginbottom-20', [
                                    m('.w-col.w-col-4',
                                        m('.fontweight-semibold.fontsize-small.u-marginbottom-10',
                                            'Projetos que você apoiou:'
                                        )
                                    ),
                                    m('.w-col.w-col-8',
                                        m('.w-checkbox.w-clearfix', [
                                            m('input[name=user[subscribed_to_project_posts]][type=\'hidden\'][value=\'0\']'),
                                            m(`input.w-checkbox-input${user.subscribed_to_project_posts ? '[checked=\'checked\']' : ''}[id='user_subscribed_to_project_posts'][name=user[subscribed_to_project_posts]][type='checkbox'][value='1']`),
                                            m('label.w-form-label.fontsize-base.fontweight-semibold',
                                                ' Quero receber atualizações dos projetos'
                                            ),
                                            m('.u-marginbottom-20',
                                                m('a.alt-link[href=\'javascript:void(0);\']', {
                                                    onclick: ctrl.showNotifications.toggle
                                                },
                                                    ` Gerenciar as notificações de ${user.total_contributed_projects} projetos`
                                                )
                                            ),
                                            (ctrl.showNotifications() ?
                                                m('ul.w-list-unstyled.u-radius.card.card-secondary[id=\'notifications-box\']', [
                                                    (!_.isEmpty(projects_collection) ? _.map(projects_collection, project => m('li',
                                                            m('.w-checkbox.w-clearfix', [
                                                                m(`input[id='unsubscribes_${project.project_id}'][type='hidden'][value='']`, {
                                                                    name: `unsubscribes[${project.project_id}]`
                                                                }),
                                                                m(`input.w-checkbox-input${project.unsubscribed ? '' : '[checked=\'checked\']'}[type='checkbox'][value='1'][id='user_unsubscribes_${project.project_id}']`, {
                                                                    name: `unsubscribes[${project.project_id}]`
                                                                }),
                                                                m('label.w-form-label.fontsize-small',
                                                                    project.project_name
                                                                )
                                                            ])
                                                        )) : '')
                                                ]) :
                                                '')
                                        ])
                                    )
                                ]),
                                m('.w-row.u-marginbottom-20', [
                                    m('.w-col.w-col-4',
                                        m('.fontweight-semibold.fontsize-small.u-marginbottom-10',
                                            'Social:'
                                        )
                                    ),
                                    m('.w-col.w-col-8',
                                        m('.w-checkbox.w-clearfix', [
                                            m('input[name=user[subscribed_to_friends_contributions]][type=\'hidden\'][value=\'0\']'),
                                            m(`input.w-checkbox-input${user.subscribed_to_friends_contributions ? '[checked=\'checked\']' : ''}[id='user_subscribed_to_friends_contributions'][name=user[subscribed_to_friends_contributions]][type='checkbox'][value='1']`),
                                            m('label.w-form-label.fontsize-small',
                                                'Um amigo apoiou ou lançou um projeto'
                                            )
                                        ])
                                    ),
                                    m('.w-col.w-col-8',
                                        m('.w-checkbox.w-clearfix', [
                                            m('input[name=user[subscribed_to_new_followers]][type=\'hidden\'][value=\'0\']'),
                                            m(`input.w-checkbox-input${user.subscribed_to_new_followers ? '[checked=\'checked\']' : ''}[id='user_subscribed_to_new_followers'][name=user[subscribed_to_new_followers]][type='checkbox'][value='1']`),
                                            m('label.w-form-label.fontsize-small',
                                                'Um amigo começou a me seguir'
                                            )
                                        ])
                                    )
                                ]),
                                m('.w-row.u-marginbottom-20', [
                                    m('.w-col.w-col-4',
                                        m('.fontweight-semibold.fontsize-small.u-marginbottom-10',
                                            'Lembretes de projetos:'
                                        )
                                    ),
                                    m('.w-col.w-col-8', [

                                        (!_.isEmpty(reminders) ? _.map(reminders, reminder => m('.w-checkbox.w-clearfix', [
                                            m(`input[id='user_reminders_${reminder.project_id}'][type='hidden'][value='false']`, {
                                                name: `user[reminders][${reminder.project_id}]`
                                            }),
                                            m(`input.w-checkbox-input[checked='checked'][type='checkbox'][value='1'][id='user_reminders_${reminder.project_id}']`, {
                                                name: `user[reminders][${reminder.project_id}]`
                                            }),
                                            m('label.w-form-label.fontsize-small',
                                                    reminder.project_name
                                                )
                                        ])) : '')
                                    ])
                                ])
                            ])
                        )
                    ),
                    m('.u-margintop-30',
                        m('.w-container',
                            m('.w-row',
                                m('.w-col.w-col-4.w-col-push-4',
                                    m('input.btn.btn-large[id=\'save\'][name=\'commit\'][type=\'submit\'][value=\'Salvar\']')
                                )
                            )
                        )
                    )
                ])
            ])
        );
    }
};

export default userNotifications;
