import m from 'mithril';
import _ from 'underscore';
import h from '../h';
import copyTextInput from './copy-text-input';
import rewardVM from '../vms/reward-vm';
import projectVM from '../vms/project-vm';
import inlineError from './inline-error';

const I18nScope = _.partial(h.i18nScope, 'projects.reward_fields');

const dashboardRewardCard = {
    controller: function(args) {
        const reward = args.reward(),
            imageFileToUpload = m.prop(null),
            isUploadingRewardImage = m.prop(false),
            isDeletingRewardImage = m.prop(false),
            availableCount = () => reward.maximum_contributions() - reward.paid_count() - reward.waiting_payment_count(),
            limitError = m.prop(false),
            showLimited = h.toggleProp(false, true),
            toggleLimit = () => {
                reward.limited.toggle();
                reward.maximum_contributions('');
            },
            toggleShowLimit = () => {
                showLimited.toggle();
            },
            validate = () => {
                limitError(false);
                args.error(false);
                args.errors('Erro ao salvar informações.');
                if (reward.maximum_contributions() && reward.paid_count() > reward.maximum_contributions()) {
                    limitError(true);
                    args.error(true);
                }
            },
            saveReward = () => {
                validate();
                if (args.error()) {
                    return false;
                }
                const data = {
                    maximum_contributions: reward.maximum_contributions()
                };

                rewardVM.updateReward(args.project().project_id, reward.id(), data).then(() => {
                    args.showSuccess(true);
                    showLimited.toggle();
                    reward.limited(reward.maximum_contributions() !== null);
                    m.redraw();
                });
                return false;
            },
            onSelectImageFile = () => {
                const rewardImageFile = window.document.getElementById(`reward_image_file_closed_card_${args.index}`);
                if (rewardImageFile.files.length) {

                    imageFileToUpload(rewardImageFile.files[0]);
                    isUploadingRewardImage(true);
                    args.uploadImage(reward, imageFileToUpload, args.project().id, reward.id())
                        .then(r_with_image => {
                            if (r_with_image) {
                                reward.uploaded_image(r_with_image.uploaded_image);
                                imageFileToUpload(null);
                                args.showSuccess(true);
                            }
                            isUploadingRewardImage(false);
                        })
                        .catch(error => {
                            args.showSuccess(false);
                            isUploadingRewardImage(false);
                        })
                }
            },
            tryDeleteImage = () => {
                
                if (reward.newReward || imageFileToUpload()) {
                    reward.uploaded_image(null);
                    imageFileToUpload(null);
                } else {
                    isDeletingRewardImage(true);
                    args.deleteImage(reward, args.project().id, reward.id())
                        .then(r => {
                            if (r) {
                                imageFileToUpload(null);
                                reward.uploaded_image(null);
                            }
                            isDeletingRewardImage(false);
                        })
                        .catch(error => {
                            // TODO: Show error on deleting the image
                            isDeletingRewardImage(false);
                            m.redraw();
                            console.log('herer')
                        });
                }
            };

        return {
            availableCount,
            toggleShowLimit,
            toggleLimit,
            saveReward,
            showLimited,
            limitError,

            onSelectImageFile,
            tryDeleteImage,
            isUploadingRewardImage,
            isDeletingRewardImage
        };
    },
    view: function(ctrl, args) {
        const reward = args.reward();
        const project = args.project();
        const isSubscription = projectVM.isSubscription(project);
        const isUploadingRewardImage = ctrl.isUploadingRewardImage();
        const isDeletingRewardImage = ctrl.isDeletingRewardImage();

        return m('.w-row.cursor-move.card-persisted.card.card-terciary.u-marginbottom-20.medium.sortable', [
            m('.card', [
                m('.w-row', [
                    m('.w-col.w-col-11.w-col-small-11.w-col-tiny-11',
                        m('.fontsize-base.fontweight-semibold',
                            window.I18n.t(
                                isSubscription ?
                                'minimum_value_subscription_title' :
                                'minimum_value_title', I18nScope({
                                    minimum_value: reward.minimum_value()
                                }))
                        )
                    ),
                    (rewardVM.canEdit(reward, project.state, args.user) ?
                        m('.w-col.w-col-1.w-col-small-1.w-col-tiny-1',
                            m("a.show_reward_form[href='javascript:void(0);']", {
                                onclick: () => {
                                    reward.edit.toggle();
                                }
                            },
                                m('.btn.btn-small.btn-terciary.fa.fa-lg.fa-edit.btn-no-border')
                            )
                        ) : '')
                ]),
                m('.u-marginbottom-20', [
                    m('.fontsize-smaller.fontweight-semibold',
                        window.I18n.t(
                            isSubscription ?
                            'paid_subscribers' :
                            'paid_contributors', I18nScope({
                                count: reward.paid_count()
                            })
                        )
                    ),
                    m('.fontsize-smaller.fontcolor-secondary', window.I18n.t('index.contributions_to_confirm', I18nScope({
                        count: reward.waiting_payment_count()
                    })))
                ]),

                // REWARD IMAGE
                (
                    (isUploadingRewardImage || isDeletingRewardImage) ?
                        (
                            h.loader()
                        )
                    :
                        (
                            (reward.uploaded_image && reward.uploaded_image()) ? 
                                (
                                    m("div.u-marginbottom-30.w-row", [
                                        m("div.w-col.w-col-7", [
                                            m("div.fontsize-smaller.fontweight-semibold", [
                                                "Imagem",
                                                m("span.fontcolor-secondary",  " (opcional)")
                                            ]),
                                            m("div.u-marginbottom-20", 
                                                m("div.btn.btn-small.btn-terciary.fa.fa-lg.fa-trash.btn-no-border.btn-inline.u-right[href='#']", {
                                                    onclick: () => ctrl.tryDeleteImage()
                                                })
                                            ),
                                            m(`img[src='${reward.uploaded_image()}'][alt='']`)
                                        ]),
                                        m("div.w-col.w-col-5")
                                    ])
                                ) 
                            :
                                (
                                    m("div.u-marginbottom-30.w-row", [
                                        m("div.w-col.w-col-7", [
                                            m("div.fontsize-smaller.fontweight-semibold", [
                                                "Imagem",
                                                m("span.fontcolor-secondary", " (opcional)")
                                            ]),
                                            m("div.w-form", [
                                                m("form", 
                                                    m(`input.text-field.w-input[type='file'][placeholder='Choose file'][id='reward_image_file_closed_card_${args.index}']`, {
                                                        oninput: () => ctrl.onSelectImageFile()
                                                    })
                                                ),
                                                m("div.w-form-done", 
                                                    m("div", "Thank you! Your submission has been received!")
                                                ),
                                                m("div.w-form-fail", 
                                                    m("div", "Oops! Something went wrong while submitting the form.")
                                                )
                                            ])
                                        ]),
                                        m("div.w-col.w-col-5")
                                    ])                             
                                )
                        )
                ),
                // END REWARD IMAGE

                m('.fontsize-small.fontweight-semibold',
                    reward.title()
                ),
                m('.fontsize-small.fontcolor-secondary',
                    m.trust(h.simpleFormat(h.strip(reward.description()))),
                ),
                (reward.limited() ? (ctrl.availableCount() <= 0) ?
                    m('.u-margintop-10',
                        m('span.badge.badge-gone.fontsize-smaller',
                            window.I18n.t('reward_gone', I18nScope())
                        )
                    ) :
                    m('.u-margintop-10',
                        m('span.badge.badge-attention.fontsize-smaller', [
                            m('span.fontweight-bold',
                                window.I18n.t('reward_limited', I18nScope())
                            ),
                            window.I18n.t('reward_available', I18nScope({
                                available: ctrl.availableCount(),
                                maximum: reward.maximum_contributions()
                            }))
                        ])
                    ) : ''),

                reward.deliver_at() && !isSubscription ? m('.fontsize-smallest', [
                    m('b', window.I18n.t('delivery_estimation', I18nScope())),
                    h.momentify(reward.deliver_at(), 'MMM/YYYY')
                ]) : null,
                isSubscription ? null : m('.fontsize-smallest',
                    m('b', `${window.I18n.t('delivery', I18nScope())}: `),
                    window.I18n.t(`shipping_options.${reward.shipping_options()}`, I18nScope())),
                m('.u-margintop-40.w-row', [
                    (ctrl.showLimited() ? '' :
                        m('.w-col.w-col-4', [
                            m('button.btn.btn-small.btn-terciary.w-button', {
                                onclick: ctrl.toggleShowLimit
                            }, 'Alterar limite'),

                        ])),
                    m('.w-col.w-col-8')
                ]),
                m(`div${ctrl.showLimited() ? '' : '.w-hidden'}`,
                    m('.card.card-terciary.div-display-none.u-radius', {
                        style: {
                            display: 'block'
                        }
                    },
                        m('.w-form', [
                            [
                                m('.w-row', [
                                    m('.w-col.w-col-6',
                                        m('.w-checkbox', [
                                            m("input.w-checkbox-input[type='checkbox']", {
                                                onclick: ctrl.toggleLimit,
                                                checked: reward.limited()
                                            }),
                                            m('label.fontsize-smaller.fontweight-semibold.w-form-label',
                                                window.I18n.t('reward_limited_input', I18nScope())
                                            )
                                        ])
                                    ),
                                    m('.w-col.w-col-6',
                                        m('input.string.tel.optional.w-input.text-field.u-marginbottom-30.positive[placeholder=\'Quantidade disponível\'][type=\'tel\']', {
                                            class: ctrl.limitError() ? 'error' : false,
                                            value: reward.maximum_contributions(),
                                            onchange: m.withAttr('value', reward.maximum_contributions)
                                        })
                                    )
                                ]),
                                m('.w-row', [
                                    m('.w-sub-col.w-col.w-col-4',
                                        m('button.btn.btn-small.w-button', {
                                            onclick: ctrl.saveReward
                                        }, 'Salvar')
                                    ),
                                    m('.w-sub-col.w-col.w-col-4',
                                        m('button.btn.btn-small.btn-terciary.w-button', {
                                            onclick: ctrl.toggleShowLimit
                                        },
                                            'Cancelar'
                                        )
                                    ),
                                    m('.w-clearfix.w-col.w-col-4')
                                ])
                            ]
                        ])
                    )

                ),
                ctrl.limitError() ? m(inlineError, {
                    message: 'Limite deve ser maior que quantidade de apoios.'
                }) : '', ,
            ]),
            m('.u-margintop-20', [
                m('.fontcolor-secondary.fontsize-smallest.fontweight-semibold',
                    window.I18n.t('reward_link_label', I18nScope())
                ),
                m('.fontcolor-secondary.fontsize-smallest.u-marginbottom-10',
                    window.I18n.t('reward_link_hint', I18nScope())
                ),
                m('.w-form',
                    m('.w-col.w-col-6',
                        m.component(copyTextInput, {
                            value: `https://www.catarse.me/pt/projects/${project.project_id}/${isSubscription ? 'subscriptions/start' : 'contributions/new'}?reward_id=${reward.id()}`
                        }),
                    )
                ),

            ]),
        ]);
    }
};

export default dashboardRewardCard;
