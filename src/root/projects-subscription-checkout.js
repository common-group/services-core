import m from 'mithril';
import _ from 'underscore';
import I18n from 'i18n-js';
import moment from 'moment';
import {catarse} from '../api'
import models from '../models';
import h from '../h';
import contributionVM from '../vms/contribution-vm';
import rewardVM from '../vms/reward-vm';
import paymentVM from '../vms/payment-vm';
import projectVM from '../vms/project-vm';
import addressVM from '../vms/address-vm';
import usersVM from '../vms/user-vm';
import subscriptionVM from '../vms/subscription-vm';
import faqBox from '../c/faq-box';
import nationalityRadio from '../c/nationality-radio';
import paymentForm from '../c/payment-form';
import inlineError from '../c/inline-error';
import addressForm from '../c/address-form';

const I18nScope = _.partial(h.i18nScope, 'projects.contributions.edit');
const I18nIntScope = _.partial(h.i18nScope, 'projects.contributions.edit_international');

const projectsSubscriptionCheckout = {
    controller(args) {
        const project = projectVM.currentProject,
            vm = paymentVM(),
            showPaymentForm = m.prop(false),
            addVM = m.prop(),
            documentMask = _.partial(h.mask, '999.999.999-99'),
            documentCompanyMask = _.partial(h.mask, '99.999.999/9999-99'),
            isCnpj = m.prop(false),
            currentUserID = h.getUserID(),
            user = usersVM.getCurrentUser(),
            oldSubscription = m.prop({}),
            countriesLoader = catarse.loader(models.country.getPageOptions()),
            error = m.prop();

        const subscriptionId = m.prop(m.route.param('subscription_id'));
        const isEdit = m.prop(Boolean(subscriptionId()));
        const subscriptionStatus = m.route.param('subscription_status');
        const isReactivation = m.prop(subscriptionStatus === 'inactive' || subscriptionStatus === 'canceled');

        if (isEdit) {
            subscriptionVM
                .getSubscription(subscriptionId())
                .then(data => oldSubscription(_.first(data)))
                .catch(error);
        }

        if (_.isNull(currentUserID)) {
            projectVM.storeSubscribeAction(m.route());
            h.navigateToDevise();
        }

        let reward = m.prop(rewardVM.selectedReward() || rewardVM.noReward);
        let value;

        if (_.isString(rewardVM.contributionValue())) {
            value = h.monetaryToFloat(rewardVM.contributionValue);
        } else {
            value = rewardVM.contributionValue();
        }

        const valueParam = m.route.param('contribution_value');
        const rewardIdParam = m.route.param('reward_id');

        if (valueParam) {
            value = rewardVM.contributionValue(Number(valueParam));
        }

        if (rewardIdParam) {
            rewardVM.fetchRewards(projectVM.getCurrentProject().project_id).then(() => {
                reward(_.findWhere(rewardVM.rewards(), {id: Number(rewardIdParam)}));
                rewardVM.selectedReward(reward());
                m.redraw();
            });
        }

        const validateForm = () => {
            if (vm.validate()) {
                showPaymentForm(true);
            }
        };

        const fieldHasError = (fieldName) => {
            const fieldWithError = _.findWhere(vm.fields.errors(), {
                field: fieldName
            });

            return fieldWithError ? m.component(inlineError, {
                message: fieldWithError.message
            }) : '';
        };

        const applyDocumentMask = (value) => {
            if (value.length > 14) {
                isCnpj(true);
                vm.fields.ownerDocument(documentCompanyMask(value));
            } else {
                isCnpj(false);
                vm.fields.ownerDocument(documentMask(value));
            }
        };

        const addressChange = fn => (e) => {
            CatarseAnalytics.oneTimeEvent({
                cat: 'contribution_finish',
                act: vm.isInternational ? 'contribution_address_br' : 'contribution_address_int'
            });

            if (_.isFunction(fn)) {
                fn(e);
            }
        };

        const scope = attr => vm.isInternational() ?
            I18nIntScope(attr) :
            I18nScope(attr);

        const isLongDescription = reward => reward.description && reward.description.length > 110;

        vm.fetchUser().then(() => {
            addVM(addressVM({
                data: vm.fields.address()
            }));
            countriesLoader
                .load()
                .then(countryData => {
                    addVM().countries(_.sortBy(countryData, 'name_en'));
                });
        });


        projectVM.getCurrentProject();

        return {
            addressChange,
            applyDocumentMask,
            fieldHasError,
            validateForm,
            showPaymentForm,
            reward,
            value,
            addVM,
            scope,
            isCnpj,
            isEdit,
            subscriptionId,
            isReactivation,
            vm,
            user,
            project,
            isLongDescription,
            oldSubscription,
            toggleDescription: h.toggleProp(false, true),
            subscriptionStatus
        };
    },
    view(ctrl) {
        const user = ctrl.user(),
            addVM = ctrl.addVM(),
            project = ctrl.project(),
            formatedValue = h.formatNumber(ctrl.value, 2, 3),
            anonymousCheckbox = m('.w-row', [
                m('.w-checkbox.w-clearfix', [
                    m('input.w-checkbox-input[id=\'anonymous\'][name=\'anonymous\'][type=\'checkbox\']', {
                        onclick: () => CatarseAnalytics.event({
                            cat: 'contribution_finish',
                            act: 'contribution_anonymous_change'
                        }),
                        onchange: () => {
                            ctrl.vm.fields.anonymous.toggle();
                        },
                        checked: ctrl.vm.fields.anonymous()
                    }),
                    m('label.w-form-label.fontsize-smallest[for=\'anonymous\']',
                        I18n.t('fields.anonymous', ctrl.scope())
                    )
                ]),
                (ctrl.vm.fields.anonymous() ? m('.card.card-message.u-radius.zindex-10.fontsize-smallest',
                    m('div', [
                        m('span.fontweight-bold', [
                            I18n.t('anonymous_confirmation_title', ctrl.scope()),
                            m('br')
                        ]),
                        m('br'),
                        I18n.t('anonymous_confirmation', ctrl.scope())
                    ])
                ) : '')
            ]);

        return m('#project-payment', (addVM && user && !_.isEmpty(project)) ? [
            m(`.w-section.section-product.${projectVM.currentProject().mode}`),
            m('.w-section.w-clearfix.section', [
                m('.w-col',
                    m('.w-clearfix.w-hidden-main.w-hidden-medium.card.u-radius.u-marginbottom-20', [
                        m('.fontsize-smaller.fontweight-semibold.u-marginbottom-20',
                            I18n.t('selected_reward.value', ctrl.scope())
                        ),
                        m('.w-clearfix', [
                            m('.fontsize-larger.text-success.u-left',
                                `R$ ${formatedValue}`
                            ),
                            m(`a.alt-link.fontsize-smaller.u-right[href="/projects/${projectVM.currentProject().project_id}/subscriptions/start?${ctrl.reward().id ? `reward_id=${ctrl.reward().id}` : ''}${ctrl.isEdit() ? `&subscription_id=${ctrl.subscriptionId()}` : ''}${ctrl.subscriptionStatus ? '&subscription_status=' + ctrl.subscriptionStatus : ''}"]`,
                                'Editar'
                            )
                        ]),
                        m('.divider.u-marginbottom-10.u-margintop-10'),
                        m('.back-payment-info-reward', [
                            m('.fontsize-smaller.fontweight-semibold.u-marginbottom-10',
                                I18n.t('selected_reward.reward', ctrl.scope())
                            ),
                            m('.fontsize-smallest.fontweight-semibold',
                                ctrl.reward().title
                            ),
                            m('.fontsize-smallest.reward-description.opened.fontcolor-secondary', {
                                class: ctrl.isLongDescription(ctrl.reward()) ?
                                        ctrl.toggleDescription() ? 'extended' : '' : 'extended'
                            }, ctrl.reward().description ?
                                ctrl.reward().description :
                                m.trust(
                                    I18n.t('selected_reward.review_without_reward_html',
                                        ctrl.scope(
                                            _.extend({
                                                value: formatedValue
                                            })
                                        )
                                    )
                                )
                            ),
                            ctrl.isLongDescription(ctrl.reward()) ? m('a[href="javascript:void(0);"].link-hidden.link-more.u-marginbottom-20', {
                                onclick: ctrl.toggleDescription.toggle
                            }, [
                                ctrl.toggleDescription() ? 'menos ' : 'mais ',
                                m('span.fa.fa-angle-down', {
                                    class: ctrl.toggleDescription() ? 'reversed' : ''
                                })
                            ]) : '',
                            ctrl.reward().deliver_at ? m('.fontcolor-secondary.fontsize-smallest.u-margintop-10', [
                                m('span.fontweight-semibold',
                                    'Entrega prevista:'
                                ),
                                ` ${h.momentify(ctrl.reward().deliver_at, 'MMM/YYYY')}`
                            ]) : '',
                            (rewardVM.hasShippingOptions(ctrl.reward()) || ctrl.reward().shipping_options === 'presential') ?
                            m('.fontcolor-secondary.fontsize-smallest', [
                                m('span.fontweight-semibold',
                                    'Forma de envio: '
                                ),
                                I18n.t(`shipping_options.${ctrl.reward().shipping_options}`, {
                                    scope: 'projects.contributions'
                                })
                            ]) :
                            ''
                        ])
                    ])
                )
            ]),
            m('.w-container',
                m('.w-row', [
                    m('.w-col.w-col-8', [
                        m('.w-form', [
                            m('form.u-marginbottom-40', [
                                m('.u-marginbottom-40.u-text-center-small-only', [
                                    m('.fontweight-semibold.lineheight-tight.fontsize-large',
                                        I18n.t('title', ctrl.scope())
                                    ),
                                    m('.fontsize-smaller',
                                        I18n.t('required', ctrl.scope())
                                    )
                                ]),

                                (user.name && user.owner_document ?
                                    m('.card.card-terciary.u-radius.u-marginbottom-40', [
                                        m('.w-row.u-marginbottom-20', [
                                            m('.w-col.w-col-2.w-col-small-2.w-col-tiny-2.w-hidden-tiny', [
                                                m(`img.thumb.u-margintop-10.u-round[src="${h.useAvatarOrDefault(user.profile_img_thumbnail)}"][width="100"]`)
                                            ]),
                                            m('.w-col.w-col-10.w-col-small-10.w-col-tiny-10', [
                                                m('.fontcolor-secondary.fontsize-smallest.u-marginbottom-10', [
                                                    (project ? 'Dados do apoiador ' : 'Dados do usuário '),
                                                    m(`a.alt-link[href="/not-my-account?redirect_to=${encodeURIComponent(m.route())}"]`, 'Não é você?')
                                                ]),
                                                m('.fontsize-base.fontweight-semibold', user.name),
                                                (user.owner_document ?
                                                    m('label.field-label', `CPF/CNPJ: ${user.owner_document}`) : ''),

                                            ])
                                        ]),
                                        anonymousCheckbox

                                    ]) : ''),

                                (user.name && user.owner_document) ? '' : m('.card.card-terciary.u-radius.u-marginbottom-40', [
                                    (m('.w-row', [
                                        m('.w-col.w-col-7.w-sub-col', [
                                            m('label.field-label.fontweight-semibold[for=\'complete-name\']',
                                                I18n.t('fields.complete_name', ctrl.scope())
                                            ),
                                            m('input.positive.w-input.text-field[id=\'complete-name\'][name=\'complete-name\']', {
                                                onfocus: ctrl.vm.resetFieldError('completeName'),
                                                class: ctrl.fieldHasError('completeName') ? 'error' : false,
                                                type: 'text',
                                                onchange: m.withAttr('value', ctrl.vm.fields.completeName),
                                                value: ctrl.vm.fields.completeName(),
                                                placeholder: 'Nome Completo'
                                            }),
                                            ctrl.fieldHasError('completeName')
                                        ]),
                                        m('.w-col.w-col-5', addVM.international() ? '' : [
                                            m('label.field-label.fontweight-semibold[for=\'document\']',
                                                I18n.t('fields.owner_document', ctrl.scope())
                                            ),
                                            m('input.positive.w-input.text-field[id=\'document\']', {
                                                onfocus: ctrl.vm.resetFieldError('ownerDocument'),
                                                class: ctrl.fieldHasError('ownerDocument') ? 'error' : false,
                                                type: 'tel',
                                                onkeyup: m.withAttr('value', ctrl.applyDocumentMask),
                                                value: ctrl.vm.fields.ownerDocument()
                                            }),
                                            ctrl.fieldHasError('ownerDocument')
                                        ]),
                                    ])),
                                    anonymousCheckbox
                                ]),

                                m('.card.card-terciary.u-radius.u-marginbottom-40',
                                    m(addressForm, {
                                        addVM,
                                        addressFields: addVM.fields,
                                        fields: m.prop(ctrl.vm.fields),
                                        international: addVM.international,
                                        hideNationality: true
                                    })
                                )
                            ])
                        ]),
                        m('.w-row.u-marginbottom-40', !ctrl.showPaymentForm() ? m('.w-col.w-col-push-3.w-col-6',
                            m('button.btn.btn-large', {
                                onclick: () => CatarseAnalytics.event({
                                    cat: 'contribution_finish',
                                    act: 'contribution_next_click'
                                }, ctrl.validateForm)
                            },
                                I18n.t('next_step', ctrl.scope())
                            )
                        ) : ''),
                        ctrl.showPaymentForm() ? m.component(paymentForm, {
                            addressVM: addVM,
                            vm: ctrl.vm,
                            project_id: projectVM.currentProject().project_id,
                            isSubscriptionEdit: ctrl.isEdit,
                            isReactivation: ctrl.isReactivation,
                            subscriptionId: ctrl.subscriptionId,
                            user_id: user.id,
                            reward: ctrl.reward,
                            reward_common_id: ctrl.reward().common_id,
                            project_common_id: projectVM.currentProject().common_id,
                            user_common_id: user.common_id,
                            isSubscription: true,
                            oldSubscription: ctrl.oldSubscription,
                            value: ctrl.value,
                            hideSave: true
                        }) : ''
                    ]),
                    m('.w-col.w-col-4', [
                        m('.card.u-marginbottom-20.u-radius.w-hidden-small.w-hidden-tiny', [
                            m('.fontsize-smaller.fontweight-semibold.u-marginbottom-20',
                                I18n.t('selected_reward.value', ctrl.scope())
                            ),
                            m('.w-clearfix', [
                                m('.fontsize-larger.text-success.u-left',
                                    `R$ ${formatedValue}`
                                ),
                                m(`a.alt-link.fontsize-smaller.u-right[href="/projects/${projectVM.currentProject().project_id}/subscriptions/start?${ctrl.reward().id ? `reward_id=${ctrl.reward().id}` : ''}${ctrl.isEdit() ? `&subscription_id=${ctrl.subscriptionId()}` : ''}${ctrl.subscriptionStatus ? '&subscription_status=' + ctrl.subscriptionStatus : ''}"]`,
                                    {config: m.route},
                                    I18n.t('selected_reward.edit', ctrl.scope())
                                )
                            ]),
                            m('.divider.u-marginbottom-10.u-margintop-10'),
                            m('.fontsize-smaller.fontweight-semibold.u-marginbottom-10',
                                I18n.t('selected_reward.payment_plan', ctrl.scope())
                            ),
                            m('.fontsize-smaller',
                                [
                                    m('span.fontweight-semibold',
                                        [
                                            m('span.fa.fa-money.text-success'),
                                            ` ${I18n.t('selected_reward.charged_today', ctrl.scope())} ` 
                                        ]
                                    ),
                                    ctrl.isEdit() && !ctrl.isReactivation()
                                        ? ` ${I18n.t('invoice_none', I18nScope())}`
                                        : `R$ ${formatedValue}`
                                ]
                            ),
                            m('.fontsize-smaller.u-marginbottom-10',
                                [
                                    m('span.fontweight-semibold',
                                        [
                                            m('span.fa.fa-calendar-o.text-success'),
                                            ` ${I18n.t('selected_reward.next_charge', ctrl.scope())} `
                                        ]
                                    ),
                                    ctrl.isEdit() && !ctrl.isReactivation()
                                        ? ctrl.oldSubscription().next_charge_at
                                            ? h.momentify(ctrl.oldSubscription().next_charge_at)
                                            : h.momentify(Date.now())
                                        : h.lastDayOfNextMonth()
                                ]
                            ),
                            m('.divider.u-marginbottom-10.u-margintop-10'),
                            m('.back-payment-info-reward', [
                                m('.fontsize-smaller.fontweight-semibold.u-marginbottom-10',
                                    I18n.t('selected_reward.reward', ctrl.scope())
                                ),
                                m('.fontsize-smallest.fontweight-semibold',
                                    ctrl.reward().title
                                ),
                                m('.fontsize-smallest.reward-description.opened.fontcolor-secondary', {
                                    class: ctrl.isLongDescription(ctrl.reward()) ?
                                            ctrl.toggleDescription() ? 'extended' : '' : 'extended'
                                }, ctrl.reward().description ?
                                    ctrl.reward().description :
                                    m.trust(
                                        I18n.t('selected_reward.review_without_reward_html',
                                            ctrl.scope(
                                                _.extend({
                                                    value: Number(ctrl.value).toFixed()
                                                })
                                            )
                                        )
                                    )
                                ),
                                ctrl.isLongDescription(ctrl.reward()) ? m('a[href="javascript:void(0);"].link-hidden.link-more.u-marginbottom-20', {
                                    onclick: ctrl.toggleDescription.toggle
                                }, [
                                    ctrl.toggleDescription() ? 'menos ' : 'mais ',
                                    m('span.fa.fa-angle-down', {
                                        class: ctrl.toggleDescription() ? 'reversed' : ''
                                    })
                                ]) : ''
                            ]),
                        ]),
                        m.component(faqBox, {
                            mode: project.mode,
                            isEdit: ctrl.isEdit(),
                            isReactivate: ctrl.isReactivation(),
                            vm: ctrl.vm,
                            faq: ctrl.vm.faq(ctrl.isEdit() ? ctrl.isReactivation() ? `${project.mode}_reactivate` : `${project.mode}_edit` : project.mode),
                            projectUserId: project.user_id
                        })
                    ])
                ])
            )
        ] : h.loader());
    }
};

export default projectsSubscriptionCheckout;
