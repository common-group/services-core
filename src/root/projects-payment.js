import m from 'mithril';
import _ from 'underscore';
import I18n from 'i18n-js';
import h from '../h';
import contributionVM from '../vms/contribution-vm';
import rewardVM from '../vms/reward-vm';
import paymentVM from '../vms/payment-vm';
import projectVM from '../vms/project-vm';
import usersVM from '../vms/user-vm';
import faqBox from '../c/faq-box';
import paymentForm from '../c/payment-form';
import inlineError from '../c/inline-error';
import UserOwnerBox from '../c/user-owner-box';

const I18nScope = _.partial(h.i18nScope, 'projects.contributions.edit');
const I18nIntScope = _.partial(h.i18nScope, 'projects.contributions.edit_international');

const projectsPayment = {
    controller() {
        const project = projectVM.getCurrentProject(),
            mode = project.mode,
            projectUserId = project.user.id,
            vm = paymentVM(mode),
            showPaymentForm = m.prop(false),
            contribution = contributionVM.getCurrentContribution(),
            reward = m.prop(contribution().reward),
            value = contribution().value,
            phoneMask = _.partial(h.mask, '(99) 9999-99999'),
            documentMask = _.partial(h.mask, '999.999.999-99'),
            documentCompanyMask = _.partial(h.mask, '99.999.999/9999-99'),
            zipcodeMask = _.partial(h.mask, '99999-999'),
            isCnpj = m.prop(false),
            currentUserID = h.getUserID(),
            user = usersVM.getCurrentUser();

        const shippingFee = () => _.findWhere(rewardVM.fees(), { id: contribution().shipping_fee_id });

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

        const setStateOther = (el, isInit) => {
            if (!isInit) {
                vm.fields.userState('');
            }
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

        const applyZipcodeMask = _.compose(vm.fields.zipCode, zipcodeMask);

        const applyPhoneMask = _.compose(vm.fields.phone, phoneMask);

        const addressChange = fn => (e) => {
            CatarseAnalytics.oneTimeEvent({
                cat: 'contribution_finish',
                act: vm.isInternational ? 'contribution_address_br' : 'contribution_address_int'
            });

            if (_.isFunction(fn)) {
                fn(e);
            }
        };

        const scope = attr => vm.isInternational()
                   ? I18nIntScope(attr)
                   : I18nScope(attr);

        if (_.isNull(currentUserID)) {
            return h.navigateToDevise();
        }

        rewardVM.getFees(reward()).then(rewardVM.fees);
        vm.similityExecute(contribution().id);

        return {
            addressChange,
            applyDocumentMask,
            applyZipcodeMask,
            applyPhoneMask,
            fieldHasError,
            setStateOther,
            validateForm,
            projectUserId,
            showPaymentForm,
            contribution,
            reward,
            value,
            mode,
            scope,
            isCnpj,
            vm,
            user,
            project,
            shippingFee,
            toggleDescription: h.toggleProp(false, true)
        };
    },
    view(ctrl) {
        const user = ctrl.user(),
            project = ctrl.project;

        return m('#project-payment.w-section.w-clearfix.section', [
            m('.w-col',
                m('.w-clearfix.w-hidden-main.w-hidden-medium.card.u-radius.u-marginbottom-20', [
                    m('.fontsize-smaller.fontweight-semibold',
                        I18n.t('selected_reward.value', ctrl.scope())
                    ),
                    m('a.w-inline-block.arrow-admin.fa.fa-chevron-down.fontcolor-secondary[href=\'#\']'),
                    m('.w-clearfix.u-marginbottom-20',
                        m('.fontsize-larger.text-success.u-left',
                            `R$ ${Number(ctrl.value).toFixed()}`
                        )
                    ),
                    m('.w-clearfix.back-payment-info-reward', {
                        style: {
                            display: 'none'
                        }
                    }, [
                        m('.fontsize-smaller.fontweight-semibold.u-marginbottom-10',
                            I18n.t('selected_reward.reward', ctrl.scope())
                        ),
                        m('.fontsize-smallest',
                            ctrl.reward().description
                            ? ctrl.reward().description
                            : m.trust(I18n.t('selected_reward.review_without_reward_html',
                                ctrl.scope(_.extend({ value: Number(ctrl.value).toFixed() }))
                            ))
                        ),
                        m(`a.fontsize-small.link-hidden.u-right.fontweight-semibold[href="/projects/${project.project_id}/contributions/new"]`,
                            I18n.t('selected_reward.edit', ctrl.scope()))
                    ])
                ])
            ),

            m('.w-container',
                m('.w-row', [
                    m('.w-col.w-col-8', [!_.isEmpty(ctrl.vm.fields.errors()) ? m('.card.card-error.u-radius.zindex-10.u-marginbottom-30.fontsize-smaller',
                            m('.u-marginbottom-10.fontweight-bold', [
                                I18n.t('errors.global', ctrl.scope()),
                                m('.errors', _.map(ctrl.vm.fields.errors(), error => m('p', error.message)))
                            ])
                        ) : '',
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
                                user.name && user.owner_document ? m(UserOwnerBox, { user, project }) : '',
                                m('.w-row.u-marginbottom-30', [
                                    m('.w-col.w-col-7.w-sub-col', [
                                        m('label.field-label.fontweight-semibold[for=\'country\']', [
                                            'País / ',
                                            m('em', 'Country'),
                                            ' *'
                                        ]),
                                        m('select.w-select.text-field[id=\'country\']', {
                                            onfocus: ctrl.vm.resetFieldError('userCountryId'),
                                            class: ctrl.fieldHasError('userCountryId') ? 'error' : false,
                                            onchange: m.withAttr('value', ctrl.vm.fields.userCountryId),
                                            value: ctrl.vm.fields.userCountryId()
                                        },
                                            _.map(ctrl.vm.fields.countries(), (country, idx) => m('option', {
                                                value: country.id,
                                                key: idx,
                                                selected: country.id === ctrl.vm.fields.userCountryId()
                                            }, country.name_en))
                                        ),
                                        ctrl.fieldHasError('userCountryId')
                                    ]),
                                    m('.w-col.w-col-5')
                                ]),
                                ((user.name && user.owner_document) ? '' : m('.w-row', [
                                    m('.w-col.w-col-7.w-sub-col', [
                                        m('label.field-label.fontweight-semibold[for=\'complete-name\']',
                                          I18n.t('fields.complete_name', ctrl.scope())
                                         ),
                                        m('input.w-input.text-field[id=\'complete-name\'][name=\'complete-name\']', {
                                            onfocus: ctrl.vm.resetFieldError('completeName'),
                                            class: ctrl.fieldHasError('completeName') ? 'error' : false,
                                            type: 'text',
                                            onchange: m.withAttr('value', ctrl.vm.fields.completeName),
                                            value: ctrl.vm.fields.completeName(),
                                            placeholder: 'Nome Completo'
                                        }),
                                        ctrl.fieldHasError('completeName')
                                    ]),
                                    m('.w-col.w-col-5', (ctrl.vm.isInternational() ? '' : [
                                        m('label.field-label.fontweight-semibold[for=\'document\']',
                                          I18n.t('fields.owner_document', ctrl.scope())
                                         ),
                                        m('input.w-input.text-field[id=\'document\']', {
                                            onfocus: ctrl.vm.resetFieldError('ownerDocument'),
                                            class: ctrl.fieldHasError('ownerDocument') ? 'error' : false,
                                            type: 'tel',
                                            onkeyup: m.withAttr('value', ctrl.applyDocumentMask),
                                            value: ctrl.vm.fields.ownerDocument()
                                        }),
                                        ctrl.fieldHasError('ownerDocument')
                                    ])),
                                ])),
                                m('.w-checkbox.w-clearfix', [
                                    m('input.w-checkbox-input[id=\'anonymous\'][name=\'anonymous\'][type=\'checkbox\']', {
                                        onclick: () => CatarseAnalytics.event({ cat: 'contribution_finish', act: 'contribution_anonymous_change' }),
                                        onchange: m.withAttr('value', ctrl.vm.fields.anonymous),
                                        checked: ctrl.vm.fields.anonymous(),
                                    }),
                                    m('label.w-form-label.fontsize-smallest[for=\'anonymous\']',
                                        I18n.t('fields.anonymous', ctrl.scope())
                                    )
                                ]),
                                ctrl.vm.fields.anonymous() ? m('.card.card-message.u-radius.zindex-10.fontsize-smallest',
                                    m('div', [
                                        m('span.fontweight-bold', [
                                            I18n.t('anonymous_confirmation_title', ctrl.scope()),
                                            m('br')
                                        ]),
                                        m('br'),
                                        I18n.t('anonymous_confirmation', ctrl.scope())
                                    ])
                                ) : ''
                            ])
                        ]),
                        m('.u-marginbottom-40',
                            m('.w-form', [
                                m('label.field-label.fontweight-semibold[for=\'street\']',
                                    I18n.t('fields.street', ctrl.scope())
                                ),
                                m('input.w-input.text-field[id=\'street\']', {
                                    type: 'text',
                                    onfocus: ctrl.vm.resetFieldError('street'),
                                    class: ctrl.fieldHasError('street') ? 'error' : false,
                                    onchange: ctrl.addressChange(m.withAttr('value', ctrl.vm.fields.street)),
                                    value: ctrl.vm.fields.street(),
                                    placeholder: 'Rua Da Minha Casa'
                                }),
                                ctrl.fieldHasError('street'),
                                m('.w-row', ctrl.vm.isInternational() ? '' : [
                                    m('.w-col.w-col-4.w-sub-col', [
                                        m('label.field-label.fontweight-semibold[for=\'number\']',
                                            I18n.t('fields.street_number', ctrl.scope())
                                        ),
                                        m('input.w-input.text-field[id=\'number\']', {
                                            onfocus: ctrl.vm.resetFieldError('number'),
                                            class: ctrl.fieldHasError('number') ? 'error' : false,
                                            type: 'text',
                                            onchange: ctrl.addressChange(m.withAttr('value', ctrl.vm.fields.number)),
                                            value: ctrl.vm.fields.number(),
                                            placeholder: '421'
                                        }),
                                        ctrl.fieldHasError('number')
                                    ]),
                                    m('.w-col.w-col-4.w-sub-col', [
                                        m('label.field-label.fontweight-semibold[for=\'address-complement\']',
                                            I18n.t('fields.street_complement', ctrl.scope())
                                        ),
                                        m('input.w-input.text-field[id=\'address-complement\']', {
                                            onfocus: ctrl.vm.resetFieldError('addressComplement'),
                                            class: ctrl.fieldHasError('addressComplement') ? 'error' : false,
                                            type: 'text',
                                            onchange: ctrl.addressChange(m.withAttr('value', ctrl.vm.fields.addressComplement)),
                                            value: ctrl.vm.fields.addressComplement(),
                                            placeholder: 'Residencial 123'
                                        }),
                                        ctrl.fieldHasError('addressComplement')
                                    ]),
                                    m('.w-col.w-col-4', ctrl.vm.isInternational() ? '' : [
                                        m('label.field-label.fontweight-semibold[for=\'neighbourhood\']',
                                            I18n.t('fields.neighbourhood', ctrl.scope())
                                        ),
                                        m('input.w-input.text-field[id=\'neighbourhood\']', {
                                            onfocus: ctrl.vm.resetFieldError('neighbourhood'),
                                            class: ctrl.fieldHasError('neighbourhood') ? 'error' : false,
                                            type: 'text',
                                            onchange: ctrl.addressChange(m.withAttr('value', ctrl.vm.fields.neighbourhood)),
                                            value: ctrl.vm.fields.neighbourhood(),
                                            placeholder: 'São José'
                                        }),
                                        ctrl.fieldHasError('neighbourhood')
                                    ])
                                ]),
                                m('.w-row', [
                                    m('.w-col.w-col-4.w-sub-col', [
                                        m('label.field-label.fontweight-semibold[for=\'zip-code\']',
                                            I18n.t('fields.zipcode', ctrl.scope())
                                        ),
                                        m('input.w-input.text-field[id=\'zip-code\']', {
                                            type: 'tel',
                                            onfocus: ctrl.vm.resetFieldError('zipCode'),
                                            class: ctrl.fieldHasError('zipCode') ? 'error' : false,
                                            onchange: ctrl.addressChange(),
                                            onkeyup: m.withAttr('value', value => !ctrl.vm.isInternational() ? ctrl.applyZipcodeMask(value) : ctrl.vm.fields.zipCode(value)),
                                            value: ctrl.vm.fields.zipCode(),
                                            placeholder: '42100000'
                                        }),
                                        ctrl.fieldHasError('zipCode')
                                    ]),
                                    m('.w-col.w-col-4.w-sub-col', [
                                        m('label.field-label.fontweight-semibold[for=\'city\']',
                                            I18n.t('fields.city', ctrl.scope())
                                        ),
                                        m('input.w-input.text-field[id=\'city\']', {
                                            onfocus: ctrl.vm.resetFieldError('city'),
                                            class: ctrl.fieldHasError('city') ? 'error' : false,
                                            type: 'text',
                                            onchange: ctrl.addressChange(m.withAttr('value', ctrl.vm.fields.city)),
                                            value: ctrl.vm.fields.city(),
                                            placeholder: 'Cidade'
                                        }),
                                        ctrl.fieldHasError('city')
                                    ]),
                                    m('.w-col.w-col-4', [
                                        m('label.field-label.fontweight-semibold[for=\'state\']',
                                            I18n.t('fields.state', ctrl.scope())
                                        ),
                                        ctrl.vm.isInternational() ? m('input.w-input.text-field[id=\'address-state\']', {
                                            onchange: ctrl.addressChange(m.withAttr('value', ctrl.vm.fields.userState)),
                                            class: ctrl.fieldHasError('userState') ? 'error' : false,
                                            value: ctrl.vm.fields.userState()
                                        }) : m('select.w-select.text-field[id=\'address-state\']', {
                                            onfocus: ctrl.vm.resetFieldError('userState'),
                                            class: ctrl.fieldHasError('userState') ? 'error' : false,
                                            onchange: ctrl.addressChange(m.withAttr('value', ctrl.vm.fields.userState)),
                                            value: ctrl.vm.fields.userState()
                                        }, _.map(ctrl.vm.fields.states(), (state, idx) => m('option', {
                                            value: state.acronym,
                                            selected: state.acronym === ctrl.vm.fields.userState()
                                        }, state.name))
                                        ),
                                        ctrl.fieldHasError('userState')
                                    ])
                                ]),
                                !ctrl.vm.isInternational() ? m('.w-row', [
                                    m('.w-col.w-col-6', [
                                        m('label.field-label.fontweight-semibold[for=\'phone\']',
                                            I18n.t('fields.phone', ctrl.scope())
                                        ),
                                        m('input.w-input.text-field[id=\'phone\']', {
                                            onfocus: ctrl.vm.resetFieldError('phone'),
                                            class: ctrl.fieldHasError('phone') ? 'error' : false,
                                            type: 'tel',
                                            onkeyup: m.withAttr('value', ctrl.applyPhoneMask),
                                            value: ctrl.vm.fields.phone()
                                        }),
                                        ctrl.fieldHasError('phone')
                                    ])
                                ]) : ''
                            ])
                        ),
                        m('.w-row.u-marginbottom-40',
                            !ctrl.showPaymentForm() ? m('.w-col.w-col-push-3.w-col-6',
                                m('button.btn.btn-large', {
                                    onclick: () => CatarseAnalytics.event({ cat: 'contribution_finish', act: 'contribution_next_click' }, ctrl.validateForm)
                                },
                                    I18n.t('next_step', ctrl.scope())
                                )
                            ) : ''
                        ),
                        ctrl.showPaymentForm() ? m.component(paymentForm, {
                            vm: ctrl.vm,
                            contribution_id: ctrl.contribution().id,
                            project_id: projectVM.currentProject().project_id,
                            user_id: user.id
                        }) : ''
                    ]),
                    m('.w-col.w-col-4', [
                        m('.w-hidden-small.w-hidden-tiny.card.u-radius.u-marginbottom-20', [
                            m('.fontsize-smaller.fontweight-semibold.u-marginbottom-20',
                                I18n.t('selected_reward.value', ctrl.scope())
                            ),
                            m('.w-clearfix.u-marginbottom-20', [
                                m('.fontsize-larger.text-success.u-left',
                                    `R$ ${Number(ctrl.value).toFixed()}`
                                ),
                                m(`a.fontsize-small.link-hidden.u-right.fontweight-semibold[href="/projects/${projectVM.currentProject().project_id}/contributions/new${ctrl.reward().id ? `?reward_id=${ctrl.reward().id}` : ''}"]`,
                                    I18n.t('selected_reward.edit', ctrl.scope()))
                            ]),
                            m('.back-payment-info-reward', [
                                m('.fontsize-smaller.fontweight-semibold.u-marginbottom-10',
                                    I18n.t('selected_reward.reward', ctrl.scope())
                                ),
                                m('.fontsize-smallest.reward-description.opened', {
                                    class: ctrl.toggleDescription() ? 'extended' : ''
                                },
                                    ctrl.reward().description
                                    ? ctrl.reward().description
                                    : m.trust(I18n.t('selected_reward.review_without_reward_html',
                                        ctrl.scope(
                                            _.extend({ value: Number(ctrl.value).toFixed() })
                                        )
                                    ))
                                ),
                                m('a[href="javascript:void(0);"].link-hidden.link-more.u-marginbottom-20', {
                                    onclick: ctrl.toggleDescription.toggle
                                }, [
                                    ctrl.toggleDescription() ? 'menos ' : 'mais ',
                                    m('span.fa.fa-angle-down', {
                                        class: ctrl.toggleDescription() ? 'reversed' : ''
                                    })
                                ])
                            ]),
                            !_.isEmpty(ctrl.reward().deliver_at) ? [
                                m('.fontcolor-secondary.fontsize-smallest.u-margintop-10', [
                                    m('span.fontweight-semibold',
                                        'Entrega prevista: '
                                    ),
                                    h.momentify(ctrl.reward().deliver_at, 'MMM/YYYY')
                                ]),
                            ] : '',
                            ctrl.reward() && ctrl.shippingFee() ? [
                                m('.fontcolor-secondary.fontsize-smallest', [
                                    m('span.fontweight-semibold',
                                        'Envio: '
                                    ),
                                    I18n.t(`shipping_options.${ctrl.reward().shipping_options}`, {scope: 'projects.contributions'})
                                ])
                            ] : ''
                        ]),
                        m.component(faqBox, {
                            mode: ctrl.mode,
                            vm: ctrl.vm,
                            faq: ctrl.vm.faq(),
                            projectUserId: ctrl.projectUserId
                        })
                    ])
                ])
            )
        ]);
    }
};

export default projectsPayment;
