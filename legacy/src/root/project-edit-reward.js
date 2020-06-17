import m from 'mithril';
import prop from 'mithril/stream';
import _ from 'underscore';
import moment from 'moment';
import h from '../h';
import rewardVM from '../vms/reward-vm';
import userVM from '../vms/user-vm';
import popNotification from '../c/pop-notification';
import { RewardsEditList } from '../c/projects/edit/rewards-edit-list';

const I18nScope = _.partial(h.i18nScope, 'projects.reward_fields');

const projectEditReward = {
    oninit: function(vnode) {
        const rewards = prop([]),
            loading = prop(false),
            error = prop(false),
            errors = prop([]),
            showSuccess = prop(false),
            newReward = () => {
                return {
                    id: prop(null),
                    minimum_value: prop(null),
                    title: prop(''),
                    shipping_options: prop('free'),
                    edit: h.toggleProp(true, false),
                    deliver_at: prop(moment().date(1).format()),
                    description: prop(''),
                    paid_count: prop(0),
                    waiting_payment_count: prop(0),
                    limited: h.toggleProp(false, true),
                    maximum_contributions: prop(null),
                    run_out: h.toggleProp(false, true),
                    newReward: true,
                    uploaded_image: prop(null),
                    row_order: prop(999999999 + (rewards().length * 20)) // we need large and spaced apart numbers
                };
            };

        const updateRewardSortPosition = (rewardId, position) => m.request({
            method: 'POST',
            url: `/${window.I18n.locale}/projects/${vnode.attrs.project_id}/rewards/${rewardId}/sort?reward[row_order_position]=${position}`,
            config: (xhr) => {
                if (h.authenticityToken()) {
                    xhr.setRequestHeader('X-CSRF-Token', h.authenticityToken());
                    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                }
            }
        });

        const setSorting = (localVnode) => {
            if (window.$) {
                window.$(localVnode.dom).sortable({
                    update: (event, ui) => {
                        const rewardId = ui.item[0].id;
                        updateRewardSortPosition(rewardId, ui.item.index());
                    }
                });
            }
        };

        const loadRewards = () => rewardVM.fetchRewards(vnode.attrs.project_id).then(() => {
            rewards([]);
            _.map(rewardVM.rewards(), (reward) => {
                const limited = reward.maximum_contributions !== null && !reward.run_out;
                const rewardProp = prop({
                    id: prop(reward.id),
                    deliver_at: prop(reward.deliver_at),
                    description: prop(reward.description),
                    run_out: h.toggleProp(reward.run_out, !reward.run_out),
                    maximum_contributions: prop(reward.maximum_contributions),
                    minimum_value: prop(reward.minimum_value),
                    edit: h.toggleProp(false, true),
                    limited: h.toggleProp(limited, !limited),
                    paid_count: prop(reward.paid_count),
                    row_order: prop(reward.row_order),
                    shipping_options: prop(reward.shipping_options),
                    title: prop(reward.title),
                    uploaded_image: prop(reward.uploaded_image),
                    waiting_payment_count: prop(reward.waiting_payment_count)
                });
                const rewardsArray = rewards();
                rewardsArray.push(rewardProp);
                rewards(rewardsArray);
            });

            if (rewardVM.rewards().length === 0) {
                rewards([prop(newReward())]);
            }

            // const l = rewards();

            m.redraw();
        });

        const uploadImage = (reward, imageFileToUpload, projectId, rewardId) => {
            if (imageFileToUpload()) {
                return rewardVM
                    .uploadImage(projectId, rewardId, imageFileToUpload())
                    .then(r => {
                        if (r) {
                            reward.uploaded_image(r.uploaded_image);
                        }
                        return r;
                    })
                    .catch(() => {
                        error(true);
                        errors('Erro ao fazer upload da imagem da recompensa. Favor tentar novamente.');
                    });
            } else {
                return Promise.resolve();
            }
        };

        const deleteImage = (reward, projectId, rewardId) => {
            return rewardVM.deleteImage(projectId, rewardId)
                .then(r => {
                    if (r) {
                        reward.uploaded_image(r.uploaded_image);
                    }
                    return r;
                })
                .catch(() => {
                    error(true);
                    errors('Erro ao deletar a imagem da recompensa. Favor tentar novamente.');
                });
        };

        const showImageToUpload = (reward, imageFileToUpload, imageInputElementFile) => {
            const reader = new FileReader();
            reader.onload = function() {
                imageFileToUpload(imageInputElementFile);
                var dataURL = reader.result;
                reward.uploaded_image(dataURL);
                m.redraw();
            };
            reader.readAsDataURL(imageInputElementFile);
        };

        const tips = window.I18n.translations[window.I18n.currentLocale()].projects.reward_fields.faq;

        vnode.state = {
            loading,
            error,
            errors,
            showSuccess,
            tips,
        };
    },

    view({ state, attrs }) {
        const project_id = attrs.project_id;
        const user_id = attrs.user_id;
        const error = state.error;
        const errors = state.errors;
        const project = attrs.project;
        const showSuccess = state.showSuccess;
        const loading = state.loading;

        return m('[id="dashboard-rewards-tab"]',
            (project() ? [
                m('.w-section.section',
                    m('.w-container', [
                        (state.showSuccess() ? m(popNotification, {
                            message: 'Recompensa salva com sucesso'
                        }) : ''),
                        (state.error() ? m(popNotification, {
                            message: state.errors(),
                            error: true
                        }) : ''),
                        m('.w-row',
                            m('.w-col.w-col-8.w-col-push-2',
                                m('.u-marginbottom-60.u-text-center',
                                    m('.w-inline-block.card.fontsize-small.u-radius', [
                                        m('span.fa.fa-lightbulb-o'),
                                        m.trust(` ${window.I18n.t('reward_know_more_cta_html', I18nScope())}`)
                                    ])
                                )
                            )
                        ),
                        m('.w-row', [
                            m('.w-col.w-col-8',
                                m(RewardsEditList, {
                                    project_id,
                                    user_id,
                                    project,
                                    error,
                                    errors,
                                    showSuccess,
                                    loading,
                                })
                            ),
                            m('.w-col.w-col-4',
                                m('.card.u-radius', [
                                    m('.fontsize-small.u-marginbottom-20', [
                                        m('span.fa.fa-lightbulb-o.fa-lg'),
                                        m.trust(` ${window.I18n.t('reward_know_more_cta_html', I18nScope())}`)
                                    ]),
                                    m('.divider.u-marginbottom-20'),
                                    m('.fontsize-smallest.w-hidden-small.w-hidden-tiny', [
                                        window.I18n.t('reward_faq_intro', I18nScope()),
                                        m('br'),
                                        m('br'),
                                        window.I18n.t('reward_faq_sub_intro', I18nScope()),
                                        m('br'),
                                        m('br'),
                                        _.map(state.tips,
                                            (tip, idx) => project().mode === 'sub' && (Number(idx) === 3 || Number(idx) === 4) ?
                                                null 
                                                :
                                                [
                                                    m('.fontweight-semibold', tip.title),
                                                    m.trust(tip.description),
                                                    m('br'),
                                                    m('br')
                                                ]
                                        )
                                    ])
                                ])
                            )
                        ])
                    ])
                )
            ] : h.loader())
        );
    }
};

export default projectEditReward;
