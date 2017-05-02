import m from 'mithril';
import userVM from '../vms/user-vm';
import postgrest from 'mithril-postgrest';
import _ from 'underscore';
import models from '../models';
import h from '../h';
import popNotification from './pop-notification';
import UserOwnerBox from './user-owner-box';
import inlineError from './inline-error';
import projectEditSaveBtn from './project-edit-save-btn';
import userSettingsVM from '../vms/user-settings-vm';

const userSettings = {
    controller(args) {
        let parsedErrors = userSettingsVM.mapRailsErrors(args.rails_errors);
        let deleteFormSubmit;
        const user = args.user,
            fields = {
                owner_document: m.prop(user.owner_document || ''),
                country_id: m.prop(user.address.country_id || 36),
                street: m.prop(user.address.street || ''),
                number: m.prop(user.address.number || ''),
                city: m.prop(user.address.city || ''),
                zipcode: m.prop(user.address.zipcode || ''),
                complement: m.prop(user.address.complement || ''),
                neighbourhood: m.prop(user.address.neighbourhood || ''),
                state: m.prop(user.address.state || ''),
                phonenumber: m.prop(user.address.phonenumber || ''),
                name: m.prop(user.name || ''),
                state_inscription: m.prop(''),
                birth_date: m.prop((user.birth_date ? h.momentify(user.birth_date) : '')),
                account_type: m.prop(user.account_type || '')
            },
            loading = m.prop(false),
            user_id = args.userId,
            error = m.prop(''),
            countries = m.prop(),
            states = m.prop(),
            loader = m.prop(true),
            showSuccess = h.toggleProp(false, true),
            showError = h.toggleProp(false, true),
            countriesLoader = postgrest.loader(models.country.getPageOptions()),
            statesLoader = postgrest.loader(models.state.getPageOptions()),
            phoneMask = _.partial(h.mask, '(99) 9999-99999'),
            documentMask = _.partial(h.mask, '999.999.999-99'),
            documentCompanyMask = _.partial(h.mask, '99.999.999/9999-99'),
            zipcodeMask = _.partial(h.mask, '99999-999'),
            birthDayMask = _.partial(h.mask, '99/99/9999'),
            creditCards = m.prop(),
            toDeleteCard = m.prop(-1),
            deleteCard = id => () => {
                toDeleteCard(id);
                // We must redraw here to update the action output of the hidden form on the DOM.
                m.redraw(true);
                deleteFormSubmit();
                return false;
            },
            setCardDeletionForm = (el, isInit) => {
                if (!isInit) {
                    deleteFormSubmit = () => el.submit();
                }
            },
            updateUserData = (user_id) => {
                const userData = {
                    country_id: fields.country_id(),
                    address_street: fields.street(),
                    address_number: fields.number(),
                    address_city: fields.city(),
                    address_zip_code: fields.zipcode(),
                    address_complement: fields.complement(),
                    address_state: fields.state(),
                    address_neighbourhood: fields.neighbourhood(),
                    phone_number: fields.phonenumber(),
                    cpf: fields.owner_document(),
                    name: fields.name(),
                    account_type: fields.account_type(),
                    birth_date: fields.birth_date()
                };

                if (args.publishingUserSettings) {
                    userData.publishing_user_settings = true;
                }

                return m.request({
                    method: 'PUT',
                    url: `/users/${user_id}.json`,
                    data: {
                        user: userData
                    },
                    config: h.setCsrfToken
                }).then(() => {
                    if (parsedErrors) {
                        parsedErrors.resetFieldErrors();
                    }
                    loading(false);
                    if (!showSuccess()) {
                        showSuccess.toggle();
                    }
                }).catch((err) => {
                    if (parsedErrors) {
                        parsedErrors.resetFieldErrors();
                    }
                    parsedErrors = userSettingsVM.mapRailsErrors(err.errors_json);
                    error('Erro ao atualizar informações.');
                    loading(false);
                    if (showSuccess()) {
                        showSuccess.toggle();
                    }
                    if (!showError()) {
                        showError.toggle();
                    }
                });
            },
            onSubmit = () => {
                loading(true);
                updateUserData(user_id);

                m.redraw();
                return false;
            },
            applyZipcodeMask = _.compose(fields.zipcode, zipcodeMask),
            applyBirthDateMask = _.compose(fields.birth_date, birthDayMask),
            applyPhoneMask = _.compose(fields.phonenumber, phoneMask),
            applyDocumentMask = (value) => {
                if (fields.account_type() != 'pf') {
                    fields.owner_document(documentCompanyMask(value));
                } else {
                    fields.owner_document(documentMask(value));
                }
            },
            handleError = () => {
                error(true);
                loader(false);
                m.redraw();
            };

        userVM.getUserCreditCards(args.userId).then(creditCards).catch(handleError);
        countriesLoader.load().then(data => countries(_.sortBy(data, 'name_en')));
        statesLoader.load().then(states);

        if (parsedErrors.hasError('country_id')) {
            parsedErrors.inlineError('country_id', false);
        }

        return {
            handleError,
            applyDocumentMask,
            applyZipcodeMask,
            applyPhoneMask,
            countries,
            states,
            fields,
            loader,
            showSuccess,
            showError,
            user,
            onSubmit,
            error,
            creditCards,
            deleteCard,
            toDeleteCard,
            setCardDeletionForm,
            applyBirthDateMask,
            loading,
            parsedErrors
        };
    },
    view(ctrl, args) {
        let user = ctrl.user,
            fields = ctrl.fields,
            hasContributedOrPublished = (user.total_contributed_projects >= 1 || user.total_published_projects >= 1),
            disableFields = (user.is_admin_role ? false : (hasContributedOrPublished && !_.isEmpty(user.name) && !_.isEmpty(user.owner_document)));

        return m('[id=\'settings-tab\']', [
            (ctrl.showSuccess() ? m.component(popNotification, {
                message: 'As suas informações foram atualizadas',
                toggleOpt: ctrl.showSuccess
            }) : ''),
            (ctrl.showError() ? m.component(popNotification, {
                message: m.trust(ctrl.error()),
                toggleOpt: ctrl.showError,
                error: true
            }) : ''),
            m('form.w-form', {
                onsubmit: ctrl.onSubmit
            }, [
                m('div', [
                    m('.w-container',
                        m('.w-col.w-col-10.w-col-push-1',
                            // ( _.isEmpty(fields.name()) && _.isEmpty(fields.owner_document()) ? '' : m(UserOwnerBox, {user: user}) ),
                            m('.w-form.card.card-terciary', [
                                m('.fontsize-base.fontweight-semibold',
                                    'Dados financeiros'
                                ),
                                m('.fontsize-small.u-marginbottom-20', [
                                    m.trust('Essa serão as informações que utilizaremos para transferências bancárias. <strong>Importante:</strong> Nome completo/Razão social e CPF/CNPJ não poderão ser modificados após a publicação de um projeto ou a confirmação de um apoio.')
                                ]),
                                m('.divider.u-marginbottom-20'),
                                m('.w-row', [
                                    m('.w-col.w-col-6.w-sub-col',
                                        m('.input.select.required.user_bank_account_bank_id', [
                                            m(`select.select.required.w-input.text-field.bank-select.positive${(disableFields ? '.text-field-disabled' : '')}[id='user_bank_account_attributes_bank_id']`, {
                                                name: 'user[bank_account_attributes][bank_id]',
                                                onchange: m.withAttr('value', fields.account_type),
                                                disabled: disableFields
                                            }, [
                                                m('option[value=\'pf\']', {
                                                    selected: fields.account_type() === 'pf'
                                                }, 'Pessoa Física'),
                                                m('option[value=\'pj\']', {
                                                    selected: fields.account_type() === 'pj'
                                                }, 'Pessoa Jurídica'),
                                                m('option[value=\'mei\']', {
                                                    selected: fields.account_type() === 'mei'
                                                }, 'Pessoa Jurídica (Micro Empreendedor Individual - MEI)'),
                                            ])
                                        ])
                                    ),
                                ]),
                                m('.w-row', [
                                    m('.w-col.w-col-6.w-sub-col', [
                                        m('label.text.required.field-label.field-label.fontweight-semibold.force-text-dark[for=\'user_bank_account_attributes_owner_name\']',
                                            `Nome completo${fields.account_type() == 'pf' ? '' : '/Razão Social'}`
                                        ),
                                        m(`input.string.required.w-input.text-field.positive${(disableFields ? '.text-field-disabled' : '')}[id='user_bank_account_attributes_owner_name'][type='text']`, {
                                            value: fields.name(),
                                            name: 'user[name]',
                                            class: ctrl.parsedErrors.hasError('name') ? 'error' : false,
                                            onchange: m.withAttr('value', fields.name),
                                            disabled: disableFields
                                        }),
                                        ctrl.parsedErrors.inlineError('name')
                                    ]),
                                    m('.w-col.w-col-6', [
                                        m('.w-row', [
                                            m('.w-col.w-col-6.w-col-small-6.w-col-tiny-6.w-sub-col-middle', [
                                                m('label.text.required.field-label.field-label.fontweight-semibold.force-text-dark[for=\'user_bank_account_attributes_owner_document\']',
                                                    `${fields.account_type() == 'pf' ? 'CPF' : 'CNPJ'}`
                                                ),
                                                m(`input.string.tel.required.w-input.text-field.positive${(disableFields ? '.text-field-disabled' : '')}[data-validate-cpf-cnpj='true'][id='user_bank_account_attributes_owner_document'][type='tel'][validation_text='true']`, {
                                                    value: fields.owner_document(),
                                                    class: ctrl.parsedErrors.hasError('owner_document') ? 'error' : false,
                                                    disabled: disableFields,
                                                    name: 'user[cpf]',
                                                    onchange: m.withAttr('value', ctrl.applyDocumentMask),
                                                    onkeyup: m.withAttr('value', ctrl.applyDocumentMask)
                                                }),
                                                ctrl.parsedErrors.inlineError('owner_document')
                                            ]),
                                            m('.w-col.w-col-6.w-col-small-6.w-col-tiny-6', (fields.account_type() == 'pf' ? [
                                                m('label.text.required.field-label.field-label.fontweight-semibold.force-text-dark[for=\'user_bank_account_attributes_owner_document\']',
                                                    'Data de nascimento'
                                                ),
                                                m(`input.string.tel.required.w-input.text-field.positive${((disableFields && !_.isEmpty(user.birth_date)) ? '.text-field-disabled' : '')}[data-validate-cpf-cnpj='true'][id='user_bank_account_attributes_owner_document'][type='tel'][validation_text='true']`, {
                                                    value: fields.birth_date(),
                                                    name: 'user[birth_date]',
                                                    class: ctrl.parsedErrors.hasError('birth_date') ? 'error' : false,
                                                    disabled: (disableFields && !_.isEmpty(user.birth_date)),
                                                    onchange: m.withAttr('value', ctrl.applyBirthDateMask),
                                                    onkeyup: m.withAttr('value', ctrl.applyBirthDateMask)
                                                }),
                                                ctrl.parsedErrors.inlineError('birth_date')
                                            ] : [
                                                m('label.text.required.field-label.field-label.fontweight-semibold.force-text-dark[for=\'user_bank_account_attributes_owner_document\']',
                                                    'Inscrição Estadual'
                                                ),
                                                m('input.string.tel.required.w-input.text-field.positive[data-validate-cpf-cnpj=\'true\'][id=\'user_bank_account_attributes_owner_document\'][type=\'tel\'][validation_text=\'true\']', {
                                                    value: fields.state_inscription(),
                                                    class: ctrl.parsedErrors.hasError('state_inscription') ? 'error' : false,
                                                    name: 'user[state_inscription]',
                                                    onchange: m.withAttr('value', fields.state_inscription)
                                                }),
                                                ctrl.parsedErrors.inlineError('state_inscription')
                                            ]))
                                        ])
                                    ])

                                ]),
                                //m(userBankForm, {})
                            ]),
                            m('.w-form.card.card-terciary.u-marginbottom-20', [
                                m('.fontsize-base.fontweight-semibold',
                                    'Endereço'
                                ),
                                m('.fontsize-small.u-marginbottom-20.u-marginbottom-20', [
                                    'Os dados abaixo serão utilizados para envio de recompensas e para emissão de Nota Fiscal, caso aplicável.'
                                ]),
                                m('.w-row', [
                                    m('.input.select.optional.user_country.w-col.w-col-6.w-sub-col', [
                                        m('label.field-label',
                                            'País'
                                        ),
                                        m('select.select.optional.w-input.text-field.w-select.positive[id=\'user_country_id\'][name=\'user[country_id]\']', {
                                            onchange: m.withAttr('value', fields.country_id),
                                            class: ctrl.parsedErrors.hasError('country_id') ? 'error' : false
                                        }, [
                                            m('option[value=\'\']'),
                                            (!_.isEmpty(ctrl.countries()) ?
                                                _.map(ctrl.countries(), country => m(`option${country.id == fields.country_id() ? '[selected="selected"]' : ''}`, {
                                                    value: country.id
                                                },
                                                    country.name_en
                                                )) :
                                                '')
                                        ]),
                                        ctrl.parsedErrors.inlineError('country_id')
                                    ]),
                                    m('.w-col.w-col-6')
                                ]),
                                m('.w-row', [
                                    m('.input.string.optional.user_address_street.w-col.w-col-6.w-sub-col', [
                                        m('label.field-label',
                                            'Endereço'
                                        ),
                                        m('input.string.optional.w-input.text-field.w-input.text-field.positive[data-required-in-brazil=\'true\'][id=\'user_address_street\'][name=\'user[address_street]\'][type=\'text\']', {
                                            value: fields.street(),
                                            class: ctrl.parsedErrors.hasError('street') ? 'error' : false,
                                            onchange: m.withAttr('value', fields.street)
                                        }),
                                        ctrl.parsedErrors.inlineError('street')
                                    ]),
                                    m('.w-col.w-col-6',
                                        m('.w-row', [
                                            m('.input.tel.optional.user_address_number.w-col.w-col-6.w-col-small-6.w-col-tiny-6.w-sub-col-middle', [
                                                m('label.field-label',
                                                    'Número'
                                                ),
                                                m('input.string.tel.optional.w-input.text-field.w-input.text-field.positive[id=\'user_address_number\'][name=\'user[address_number]\'][type=\'tel\']', {
                                                    value: fields.number(),
                                                    class: ctrl.parsedErrors.hasError('number') ? 'error' : false,
                                                    onchange: m.withAttr('value', fields.number)
                                                }),
                                                ctrl.parsedErrors.inlineError('number')
                                            ]),
                                            m('.input.string.optional.user_address_complement.w-col.w-col-6.w-col-small-6.w-col-tiny-6', [
                                                m('label.field-label',
                                                    'Complemento'
                                                ),
                                                m('input.string.optional.w-input.text-field.w-input.text-field.positive[id=\'user_address_complement\'][name=\'user[address_complement]\'][type=\'text\']', {
                                                    value: fields.complement(),
                                                    class: ctrl.parsedErrors.hasError('complement') ? 'error' : false,
                                                    onchange: m.withAttr('value', fields.complement)
                                                }),
                                                ctrl.parsedErrors.inlineError('complement')
                                            ])
                                        ])
                                    )
                                ]),
                                m('.w-row', [
                                    m('.input.string.optional.user_address_neighbourhood.w-col.w-col-6.w-sub-col', [
                                        m('label.field-label',
                                            'Bairro'
                                        ),
                                        m('input.string.optional.w-input.text-field.w-input.text-field.positive[id=\'user_address_neighbourhood\'][name=\'user[address_neighbourhood]\'][type=\'text\']', {
                                            value: fields.neighbourhood(),
                                            class: ctrl.parsedErrors.hasError('neighbourhood') ? 'error' : false,
                                            onchange: m.withAttr('value', fields.neighbourhood)
                                        }),
                                        ctrl.parsedErrors.inlineError('neighbourhood')
                                    ]),
                                    m('.input.string.optional.user_address_city.w-col.w-col-6', [
                                        m('label.field-label',
                                            'Cidade'
                                        ),
                                        m('input.string.optional.w-input.text-field.w-input.text-field.positive[data-required-in-brazil=\'true\'][id=\'user_address_city\'][name=\'user[address_city]\'][type=\'text\']', {
                                            value: fields.city(),
                                            class: ctrl.parsedErrors.hasError('city') ? 'error' : false,
                                            onchange: m.withAttr('value', fields.city)
                                        }),
                                        ctrl.parsedErrors.inlineError('city')
                                    ])
                                ]),
                                m('.w-row', [
                                    m('.input.select.optional.user_address_state.w-col.w-col-6.w-sub-col', [
                                        m('label.field-label',
                                            'Estado'
                                        ),
                                        m('select.select.optional.w-input.text-field.w-select.text-field.positive[data-required-in-brazil=\'true\'][id=\'user_address_state\'][name=\'user[address_state]\']', {
                                            class: ctrl.parsedErrors.hasError('state') ? 'error' : false,
                                            onchange: m.withAttr('value', fields.state)
                                        }, [
                                            m('option[value=\'\']'),
                                            (!_.isEmpty(ctrl.states()) ?
                                                _.map(ctrl.states(), state => m(`option[value='${state.acronym}']${state.acronym == fields.state() ? '[selected="selected"]' : ''}`, {
                                                    value: state.acronym
                                                },
                                                    state.name
                                                ))

                                                :
                                                ''),
                                            m('option[value=\'outro / other\']',
                                                'Outro / Other'
                                            )
                                        ]),
                                        ctrl.parsedErrors.inlineError('state')
                                    ]),
                                    m('.w-col.w-col-6',
                                        m('.w-row', [
                                            m('.input.tel.optional.user_address_zip_code.w-col.w-col-6.w-col-small-6.w-col-tiny-6.w-sub-col-middle', [
                                                m('label.field-label',
                                                    'CEP'
                                                ),
                                                m('input.string.tel.optional.w-input.text-field.w-input.text-field.positive[data-fixed-mask=\'99999-999\'][data-required-in-brazil=\'true\'][id=\'user_address_zip_code\'][name=\'user[address_zip_code]\'][type=\'tel\']', {
                                                    value: fields.zipcode(),
                                                    class: ctrl.parsedErrors.hasError('zipcode') ? 'error' : false,
                                                    onchange: m.withAttr('value', fields.zipcode)
                                                }),
                                                ctrl.parsedErrors.inlineError('zipcode')
                                            ]),
                                            m('.input.tel.optional.user_phone_number.w-col.w-col-6.w-col-small-6.w-col-tiny-6', [
                                                m('label.field-label',
                                                    'Telefone'
                                                ),
                                                m('input.string.tel.optional.w-input.text-field.w-input.text-field.positive[data-fixed-mask=\'(99) 9999-99999\'][data-required-in-brazil=\'true\'][id=\'user_phone_number\'][name=\'user[phone_number]\'][type=\'tel\']', {
                                                    value: fields.phonenumber(),
                                                    onchange: m.withAttr('value', fields.phonenumber),
                                                    class: ctrl.parsedErrors.hasError('phonenumber') ? 'error' : false,
                                                    onkeyup: m.withAttr('value', value => ctrl.applyPhoneMask(value))
                                                }),
                                                ctrl.parsedErrors.inlineError('phonenumber')
                                            ])
                                        ])
                                    )
                                ]),
                            ]),
                            (args.hideCreditCards ? '' : m('.w-form.card.card-terciary.u-marginbottom-20', [
                                m('.fontsize-base.fontweight-semibold',
                                    'Cartões de crédito'
                                ),
                                m('.fontsize-small.u-marginbottom-20', [
                                    'Caso algum projeto que você tenha apoiado ',
                                    m('b',
                                        'com Cartão de Crédito'
                                    ),
                                    ' não seja bem-sucedido, nós efetuaremos o reembolso ',
                                    m('b',
                                        'automaticamente'
                                    ),
                                    ' no cartão utilizado para efetuar o apoio. '
                                ]),
                                m('.divider.u-marginbottom-20'),
                                m('.w-row.w-hidden-tiny.card', [
                                    m('.w-col.w-col-5.w-col-small-5',
                                        m('.fontsize-small.fontweight-semibold',
                                            'Cartão'
                                        )
                                    ),
                                    m('.w-col.w-col-5.w-col-small-5',
                                        m('.fontweight-semibold.fontsize-small',
                                            'Operadora'
                                        )
                                    ),
                                    m('.w-col.w-col-2.w-col-small-2')
                                ]),

                                (_.map(ctrl.creditCards(), card => m('.w-row.card', [
                                    m('.w-col.w-col-5.w-col-small-5',
                                        m('.fontsize-small.fontweight-semibold', [
                                            'XXXX XXXX XXXX',
                                            m.trust('&nbsp;'),
                                            card.last_digits
                                        ])
                                    ),
                                    m('.w-col.w-col-5.w-col-small-5',
                                        m('.fontsize-small.fontweight-semibold.u-marginbottom-10',
                                            card.card_brand.toUpperCase()
                                        )
                                    ),
                                    m('.w-col.w-col-2.w-col-small-2',
                                        m('a.btn.btn-terciary.btn-small[rel=\'nofollow\']', {
                                            onclick: ctrl.deleteCard(card.id)
                                        },
                                            'Remover'
                                        )
                                    )
                                ]))),
                                m('form.w-hidden', {
                                    action: `/pt/users/${user.id}/credit_cards/${ctrl.toDeleteCard()}`,
                                    method: 'POST',
                                    config: ctrl.setCardDeletionForm
                                }, [
                                    m('input[name=\'utf8\'][type=\'hidden\'][value=\'✓\']'),
                                    m('input[name=\'_method\'][type=\'hidden\'][value=\'delete\']'),
                                    m(`input[name='authenticity_token'][type='hidden'][value='${h.authenticityToken()}']`),
                                ])
                            ])),
                        )
                    ),


                    m(projectEditSaveBtn, {
                        loading: ctrl.loading,
                        onSubmit: ctrl.onSubmit
                    })

                ])
            ])
        ]);
    }
};

export default userSettings;
