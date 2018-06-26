import m from 'mithril';
import _ from 'underscore';
import h from '../h';
import contributionVM from '../vms/contribution-vm';
import rewardVM from '../vms/reward-vm';
import paymentVM from '../vms/payment-vm';
import projectVM from '../vms/project-vm';
import addressVM from '../vms/address-vm';
import usersVM from '../vms/user-vm';
import faqBox from '../c/faq-box';
import nationalityRadio from '../c/nationality-radio';
import paymentForm from '../c/payment-form';
import inlineError from '../c/inline-error';
import addressForm from '../c/address-form';

const { CatarseAnalytics } = window;

const I18nScope = _.partial(h.i18nScope, 'projects.contributions.edit');
const I18nIntScope = _.partial(h.i18nScope, 'projects.contributions.edit_international');

const projectsPayment = {
    controller(args) {
        const project = projectVM.currentProject,
            vm = paymentVM(),
            showPaymentForm = m.prop(false),
            addVM = m.prop(),
            contribution = contributionVM.getCurrentContribution(),
            reward = m.prop(contribution().reward),
            value = contribution().value,
            documentMask = _.partial(h.mask, '999.999.999-99'),
            documentCompanyMask = _.partial(h.mask, '99.999.999/9999-99'),
            isCnpj = m.prop(false),
            currentUserID = h.getUserID(),
            user = usersVM.getCurrentUser();

        const shippingFee = () => _.findWhere(rewardVM.fees(), {
            id: contribution().shipping_fee_id
        });

        const validateForm = () => {
            if (vm.validate()) {
                vm.similityExecute(contribution().id);
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

        if (_.isNull(currentUserID)) {
            return h.navigateToDevise();
        }
        if(reward() && !_.isNull(reward().id)) {
            rewardVM.getFees(reward()).then(rewardVM.fees);
        }
        vm.fetchUser().then(() => {
            addVM(addressVM({
                data: vm.fields.address()
            }));
        });
        vm.similityExecute(contribution().id);
        projectVM.getCurrentProject();

        return {
            addressChange,
            applyDocumentMask,
            fieldHasError,
            validateForm,
            showPaymentForm,
            contribution,
            reward,
            value,
            addVM,
            scope,
            isCnpj,
            vm,
            user,
            project,
            shippingFee,
            isLongDescription,
            toggleDescription: h.toggleProp(false, true)
        };
    },
    view(ctrl) {
        const user = ctrl.user(),
            addVM = ctrl.addVM(),
            project = ctrl.project(),
            formatedValue = h.formatNumber(Number(ctrl.value), 2, 3),
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
                        checked: ctrl.vm.fields.anonymous(),
                    }),
                    m('label.w-form-label.fontsize-smallest[for=\'anonymous\']',
                        window.I18n.t('fields.anonymous', ctrl.scope())
                    )
                ]),

                (ctrl.vm.fields.anonymous() ? m('.card.card-message.u-radius.zindex-10.fontsize-smallest',
                    m('div', [
                        m('span.fontweight-bold', [
                            window.I18n.t('anonymous_confirmation_title', ctrl.scope()),
                            m('br')
                        ]),
                        m('br'),
                        window.I18n.t('anonymous_confirmation', ctrl.scope())
                    ])
                ) : '')
            ]);

        return m('#project-payment.w-section.w-clearfix.section', (addVM && !_.isEmpty(project)) ? [
            m('.w-col',
                m('.w-clearfix.w-hidden-main.w-hidden-medium.card.u-radius.u-marginbottom-20', [
                    m('.fontsize-smaller.fontweight-semibold.u-marginbottom-20',
                        window.I18n.t('selected_reward.value', ctrl.scope())
                    ),
                    m('.w-clearfix', [
                        m('.fontsize-larger.text-success.u-left',
                            `R$ ${formatedValue}`
                        ),
                        m(`a.alt-link.fontsize-smaller.u-right[href="/projects/${projectVM.currentProject().project_id}/contributions/new${ctrl.reward().id ? `?reward_id=${ctrl.reward().id}` : ''}"]`,
                            'Editar'
                        )
                    ]),
                    m('.divider.u-marginbottom-10.u-margintop-10'),
                    m('.back-payment-info-reward', [
                        m('.fontsize-smaller.fontweight-semibold.u-marginbottom-10',
                            window.I18n.t('selected_reward.reward', ctrl.scope())
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
                                window.I18n.t('selected_reward.review_without_reward_html',
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
                            window.I18n.t(`shipping_options.${ctrl.reward().shipping_options}`, {
                                scope: 'projects.contributions'
                            })
                        ]) :
                        ''
                    ])
                ])
            ),

            m('.w-container',
                m('.w-row', [
                    m('.w-col.w-col-8', [
                        m('.w-form', [
                            m('form.u-marginbottom-40', [
                                m('.u-marginbottom-40.u-text-center-small-only', [
                                    m('.fontweight-semibold.lineheight-tight.fontsize-large',
                                        window.I18n.t('title', ctrl.scope())
                                    ),
                                    m('.fontsize-smaller',
                                        window.I18n.t('required', ctrl.scope())
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
                                                    m(`a.alt-link[href="/not-my-account${project ? `?project_id=${project.project_id}` : ''}${ctrl.reward() ? `&reward_id=${ctrl.reward().id}` : ''}${ctrl.value ? `&value=${ctrl.value * 100}` : ''}"]`, 'Não é você?')
                                                ]),
                                                m('.fontsize-base.fontweight-semibold', user.name),
                                                (user.owner_document ?
                                                    m('label.field-label', `CPF/CNPJ: ${user.owner_document}`) : ''),

                                            ])
                                        ]),
                                        anonymousCheckbox
                                    ]) : ''),

                                m('.card.card-terciary.u-marginbottom-30.u-radius.w-form',
                                    m(nationalityRadio, {
                                        fields: addVM.fields,
                                        defaultCountryID: addVM.defaultCountryID,
                                        defaultForeignCountryID: addVM.defaultForeignCountryID,
                                        international: addVM.international
                                    })
                                ),

                                (user.name && user.owner_document) ? '' : m('.card.card-terciary.u-radius.u-marginbottom-40', [
                                    (m('.w-row', [
                                        m('.w-col.w-col-7.w-sub-col', [
                                            m('label.field-label.fontweight-semibold[for=\'complete-name\']',
                                                window.I18n.t('fields.complete_name', ctrl.scope())
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
                                        m('.w-col.w-col-5', (addVM.international() ? '' : [
                                            m('label.field-label.fontweight-semibold[for=\'document\']',
                                                window.I18n.t('fields.owner_document', ctrl.scope())
                                            ),
                                            m('input.positive.w-input.text-field[id=\'document\']', {
                                                onfocus: ctrl.vm.resetFieldError('ownerDocument'),
                                                class: ctrl.fieldHasError('ownerDocument') ? 'error' : false,
                                                type: 'tel',
                                                onkeyup: m.withAttr('value', ctrl.applyDocumentMask),
                                                value: ctrl.vm.fields.ownerDocument()
                                            }),
                                            ctrl.fieldHasError('ownerDocument')
                                        ])),
                                    ])),
                                    anonymousCheckbox
                                ]),

                                m('.card.card-terciary.u-radius.u-marginbottom-40',
                                    m(addressForm, {
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
                                window.I18n.t('next_step', ctrl.scope())
                            )
                        ) : ''),
                        ctrl.showPaymentForm() ? m.component(paymentForm, {
                            vm: ctrl.vm,
                            contribution_id: ctrl.contribution().id,
                            project_id: projectVM.currentProject().project_id,
                            user_id: user.id
                        }) : ''
                    ]),
                    m('.w-col.w-col-4', [
                        m('.card.u-marginbottom-20.u-radius.w-hidden-small.w-hidden-tiny', [
                            m('.fontsize-smaller.fontweight-semibold.u-marginbottom-20',
                                window.I18n.t('selected_reward.value', ctrl.scope())
                            ),
                            m('.w-clearfix', [
                                m('.fontsize-larger.text-success.u-left',
                                    `R$ ${formatedValue}`
                                ),
                                m(`a.alt-link.fontsize-smaller.u-right[href="/projects/${projectVM.currentProject().project_id}/contributions/new${ctrl.reward().id ? `?reward_id=${ctrl.reward().id}` : ''}"]`,
                                    'Editar'
                                )
                            ]),
                            m('.divider.u-marginbottom-10.u-margintop-10'),
                            m('.back-payment-info-reward', [
                                m('.fontsize-smaller.fontweight-semibold.u-marginbottom-10',
                                    window.I18n.t('selected_reward.reward', ctrl.scope())
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
                                        window.I18n.t('selected_reward.review_without_reward_html',
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
                                ]) : '',
                                ctrl.reward().deliver_at ? m('.fontcolor-secondary.fontsize-smallest.u-margintop-10', [
                                    m('span.fontweight-semibold',
                                        'Entrega prevista:'
                                    ),
                                    ` ${h.momentify(ctrl.reward().deliver_at, 'MMM/YYYY')}`
                                ]) : '',
                                (ctrl.reward() && (rewardVM.hasShippingOptions(ctrl.reward()) || ctrl.reward().shipping_options === 'presential')) ?
                                m('.fontcolor-secondary.fontsize-smallest', [
                                    m('span.fontweight-semibold',
                                        'Forma de envio: '
                                    ),
                                    window.I18n.t(`shipping_options.${ctrl.reward().shipping_options}`, {
                                        scope: 'projects.contributions'
                                    })
                                ]) :
                                '',
                                m('div',
                                    // ctrl.contribution().shipping_fee_id ? [
                                    //     m('.divider.u-marginbottom-10.u-margintop-10'),
                                    //     m('.fontsize-smaller.fontweight-semibold',
                                    //         'Destino da recompensa:'
                                    //     ),
                                    //     m(`a.alt-link.fontsize-smaller.u-right[href="/projects/${projectVM.currentProject().project_id}/contributions/new${ctrl.reward().id ? `?reward_id=${ctrl.reward().id}` : ''}"]`,
                                    //         'Editar'
                                    //     ),
                                    //     m('.fontsize-smaller', { style: 'padding-right: 42px;' },
                                    //         `${rewardVM.feeDestination(ctrl.reward(), ctrl.contribution().shipping_fee_id)}`
                                    //     ),
                                    //     m('p.fontsize-smaller', `(R$ ${rewardVM.shippingFeeById(ctrl.contribution().shipping_fee_id) ? rewardVM.shippingFeeById(ctrl.contribution().shipping_fee_id).value : '...'})`)
                                    // ] : ''
                                )
                            ]),
                        ]),
                        m.component(faqBox, {
                            mode: project.mode,
                            vm: ctrl.vm,
                            faq: ctrl.vm.faq(project.mode),
                            projectUserId: project.user_id
                        })
                    ])
                ])
            )
        ] : h.loader());
    }
};

export default projectsPayment;
