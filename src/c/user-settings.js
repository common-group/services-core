import m from 'mithril';
import models from '../models';
import postgrest from 'mithril-postgrest';
import _ from 'underscore';
import h from '../h';
import userVM from '../vms/user-vm';
import inlineError from './inline-error';
import popNotification from './pop-notification';

const userSettings = {
    controller(args) {
        let deleteUser;
        const user = args.user,
            fields = {
                email: m.prop(''),
                email_confirmation: m.prop(''),
                password: m.prop(''),
                current_password: m.prop(''),
                owner_document: m.prop(user.owner_document),
                country_id: m.prop(user.address.country_id),
                street: m.prop(user.address.street),
                number: m.prop(user.address.number),
                city: m.prop(user.address.city),
                zipcode: m.prop(user.address.zipcode),
                complement: m.prop(user.address.complement),
                neighbourhood: m.prop(user.address.neighbourhood),
                state: m.prop(user.address.state),
                phonenumber: m.prop(user.address.phonenumber),
                name: m.prop(user.name)
            },
            emailHasError = m.prop(false),
            passwordHasError = m.prop(false),
            user_id = args.userId,
            error = m.prop(''),
            countries = m.prop(),
            states = m.prop(),
            loader = m.prop(true),
            showEmailForm = h.toggleProp(false, true),
            showSuccess = m.prop(false),
            showError = m.prop(false),
            countriesLoader = postgrest.loader(models.country.getPageOptions()),
            statesLoader = postgrest.loader(models.state.getPageOptions()),
            phoneMask = _.partial(h.mask, '(99) 9999-99999'),
            documentMask = _.partial(h.mask, '999.999.999-99'),
            documentCompanyMask = _.partial(h.mask, '99.999.999/9999-99'),
            zipcodeMask = _.partial(h.mask, '99999-999'),
            isCnpj = m.prop(false),
            setCsrfToken = (xhr) => {
                if (h.authenticityToken()) {
                    xhr.setRequestHeader('X-CSRF-Token', h.authenticityToken());
                }
                return;
            },
            updateUserData = (user_id) => {
                const userData = {
                    email: fields.email(),
                    country_id: fields.country_id(),
                    address_street: fields.street(),
                    address_number: fields.number(),
                    address_city: fields.city(),
                    address_zip_code: fields.zipcode(),
                    address_complement: fields.complement(),
                    address_state: fields.state(),
                    address_neighbourhood: fields.neighbourhood(),
                    phone_number: fields.phonenumber(),
                    owner_document: fields.owner_document(),
                    current_password: fields.current_password(),
                    password: fields.password(),
                    name: fields.name()
                };

                return m.request({
                    method: 'PUT',
                    url: `/users/${user_id}.json`,
                    data: {
                        user: userData
                    },
                    config: setCsrfToken
                }).then(() => {
                    showSuccess(true);
                    m.redraw();
                }).catch((err) => {
                    if (_.isArray(err.errors)) {
                        error(err.errors.join('\n'));
                    } else {
                        error('Erro ao atualizar informações.');
                    }

                    showError(true);
                    m.redraw();
                });
            },
            setDeleteForm = (el, isInit) => {
                if (!isInit) {
                    deleteUser = () => el.submit();
                }
            },
            deleteAccount = () => {
                if (window.confirm('Tem certeza que deseja desativar a sua conta?')) {
                    deleteUser();
                };

                return false;
            },
            validateEmailConfirmation = () => {
                if (fields.email() !== fields.email_confirmation()) {
                    emailHasError(true);
                } else {
                    emailHasError(false);
                }
                return !emailHasError();
            },
            validatePassword = () => {
                const pass = String(fields.password());
                if (pass.length > 0 && pass.length <= 5) {
                    passwordHasError(true);
                }

                return !passwordHasError();
            },
            validateDocument = () => {
                const document = fields.owner_document(),
                    striped = String(document).replace(/[\.|\-|\/]*/g,'');
                let isValid = false, errorMessage = '';

                if (document.length > 14) {
                    return h.validateCnpj(document);
                } else if (document.length > 0) {
                    return h.validateCpf(striped);
                }

                return;
            },
            // TODO: this form validation should be abstracted/merged together with others
            onSubmit = () => {
                if (!validateEmailConfirmation()) {
                    error('Confirmação de email está incorreta.');
                    showError(true);
                } else if (!validatePassword()) {
                    error('Nova senha está incorreta.');
                    showError(true);
                } else if (!validateDocument()) {
                    error('CPF/CNPJ inválido');
                    showError(true);
                } else {
                    updateUserData(user_id);
                }

                return false;
            },
            applyZipcodeMask = _.compose(fields.zipcode, zipcodeMask),
            applyPhoneMask = _.compose(fields.phonenumber, phoneMask),
            applyDocumentMask = (value) => {
                if(value.length > 14) {
                    isCnpj(true);
                    fields.owner_document(documentCompanyMask(value));
                } else  {
                    isCnpj(false);
                    fields.owner_document(documentMask(value));
                }

                return;
            };

        countriesLoader.load().then(countries);
        statesLoader.load().then(states);

        return {
            applyDocumentMask: applyDocumentMask,
            applyZipcodeMask: applyZipcodeMask,
            applyPhoneMask: applyPhoneMask,
            deleteAccount: deleteAccount,
            setDeleteForm: setDeleteForm,
            countries: countries,
            states: states,
            fields: fields,
            loader: loader,
            showSuccess: showSuccess,
            showError: showError,
            showEmailForm: showEmailForm,
            user: user,
            onSubmit: onSubmit,
            error: error,
            emailHasError: emailHasError,
            passwordHasError: passwordHasError,
            validatePassword: validatePassword,
            validateEmailConfirmation: validateEmailConfirmation
        };
    },
    view(ctrl, args) {
        let user = ctrl.user,
            fields = ctrl.fields;

        return m('[id=\'settings-tab\']', [
            (ctrl.showSuccess() ? m.component(popNotification, {
                message: 'As suas informações foram atualizadas'
            }) : ''),
            (ctrl.showError() ? m.component(popNotification, {
                message: ctrl.error(),
                error: true
            }) : ''),
            m('form.w-form', {
                onsubmit: ctrl.onSubmit
            }, [
                m('div', [
                    m('.w-container',
                        m('.w-col.w-col-10.w-col-push-1',
                            m('.w-form.card.card-terciary.u-marginbottom-20', [
                                m('.fontsize-base.fontweight-semibold',
                                    'Email'
                                ),
                                m('.fontsize-small.u-marginbottom-30',
                                    'Mantenha esse email atualizado pois ele é o canal de comunicação entre você, a equipe do Catarse e a equipe dos projetos que você apoiou. '
                                ),
                                m('.fontsize-base.u-marginbottom-40', [
                                    m('span.fontweight-semibold.card.u-radius',
                                        user.email
                                    ),
                                    m('a.alt-link.fontsize-small.u-marginleft-10[href=\'javascript:void(0);\'][id=\'update_email\']', {
                                            onclick: () => {
                                                ctrl.showEmailForm.toggle()
                                            }
                                        },
                                        'Alterar email'
                                    )
                                ]),
                                m(`${ctrl.showEmailForm() ? '' : '.w-hidden'}.u-marginbottom-20.w-row[id=\'email_update_form\']`, [
                                    m('.w-col.w-col-6.w-sub-col', [
                                        m('label.field-label.fontweight-semibold',
                                            'Novo email'
                                        ),
                                        m('input.w-input.text-field.positive[id=\'new_email\'][name=\'new_email\'][type=\'email\']', {
                                            class: ctrl.emailHasError() ? 'error' : '',
                                            value: fields.email(),
                                            onfocus: () => ctrl.emailHasError(false),
                                            onchange: m.withAttr('value', fields.email)
                                        })
                                    ]),
                                    m('.w-col.w-col-6', [
                                        m('label.field-label.fontweight-semibold',
                                            'Confirmar novo email'
                                        ),
                                        m('input.string.required.w-input.text-field.w-input.text-field.positive[id=\'new_email_confirmation\'][name=\'user[email]\'][type=\'text\']', {
                                            class: ctrl.emailHasError() ? 'error' : '',
                                            value: fields.email_confirmation(),
                                            onfocus: () => ctrl.emailHasError(false),
                                            onblur: ctrl.validateEmailConfirmation,
                                            onchange: m.withAttr('value', fields.email_confirmation)
                                        })
                                    ]),
                                    ctrl.emailHasError() ? m(inlineError, {message: 'Confirmação de email está incorreta.'}) : ''
                                ]),
                                m('.fontsize-base.fontweight-semibold',
                                    'Nome'
                                ),
                                m('.w-row.u-marginbottom-20', [
                                    m('.w-col.w-col-6.w-sub-col',
                                        m('input.string.optional.w-input.text-field.w-input.text-field.positive[id=\'user_name\'][name=\'user[name]\'][type=\'text\']', {
                                            value: fields.name(),
                                            onchange: m.withAttr('value', fields.name)
                                        })
                                    ),
                                    m('.w-col.w-col-6')
                                ]),
                                m('.fontsize-base.fontweight-semibold',
                                    'CPF / CNPJ'
                                ),
                                m('.w-row.u-marginbottom-20', [
                                    m('.w-col.w-col-6.w-sub-col',
                                        m('input.string.tel.optional.w-input.text-field.w-input.text-field.positive[data-validate-cpf-cnpj=\'true\'][id=\'user_cpf\'][name=\'user[cpf]\'][type=\'tel\']', {
                                            value: fields.owner_document(),
                                            onchange: m.withAttr('value', ctrl.applyDocumentMask),
                                            onkeyup: m.withAttr('value', ctrl.applyDocumentMask)
                                        })
                                    ),
                                    m('.w-col.w-col-6')
                                ]),
                                m('.divider.u-marginbottom-20'),
                                m('.fontsize-base.fontweight-semibold',
                                    'Endereço'
                                ),
                                m('.fontsize-small.u-marginbottom-20',
                                    'Esse é o endereço que foi informado ao realizar seu último apoio. Se você mudou de endereço, altere aqui e, caso você esteja aguardando alguma recompensa, avise por email ao realizador do projeto apoiado.'
                                ),
                                m('.w-row', [
                                    m('.input.select.optional.user_country.w-col.w-col-6.w-sub-col', [
                                        m('label.field-label',
                                            'País'
                                        ),
                                        m('select.select.optional.w-input.text-field.w-select.positive[id=\'user_country_id\'][name=\'user[country_id]\']', {
                                            onchange: m.withAttr('value', fields.country_id)
                                        }, [
                                            m('option[value=\'\']'),
                                            (!_.isEmpty(ctrl.countries()) ?
                                                _.map(ctrl.countries(), (country) => {
                                                    return m(`option${country.id == fields.country_id() ? '[selected="selected"]' : ''}`, {
                                                            value: country.id
                                                        },
                                                        country.name
                                                    );
                                                })

                                                :
                                                '')
                                        ])
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
                                            onchange: m.withAttr('value', fields.street)
                                        }),
                                        m('.fontsize-smaller.text-error.u-marginbottom-20.fa.fa-exclamation-triangle.w-hidden[data-error-for=\'user_address_street\']',
                                            ' translation missing: pt.simple_form.validation_texts.user.address_street'
                                        )
                                    ]),
                                    m('.w-col.w-col-6',
                                        m('.w-row', [
                                            m('.input.tel.optional.user_address_number.w-col.w-col-6.w-col-small-6.w-col-tiny-6.w-sub-col-middle', [
                                                m('label.field-label',
                                                    'Número'
                                                ),
                                                m('input.string.tel.optional.w-input.text-field.w-input.text-field.positive[id=\'user_address_number\'][name=\'user[address_number]\'][type=\'tel\']', {
                                                    value: fields.number(),
                                                    onchange: m.withAttr('value', fields.number)
                                                }),
                                                m('.fontsize-smaller.text-error.u-marginbottom-20.fa.fa-exclamation-triangle.w-hidden[data-error-for=\'user_address_number\']',
                                                    ' translation missing: pt.simple_form.validation_texts.user.address_number'
                                                )
                                            ]),
                                            m('.input.string.optional.user_address_complement.w-col.w-col-6.w-col-small-6.w-col-tiny-6', [
                                                m('label.field-label',
                                                    'Complemento'
                                                ),
                                                m('input.string.optional.w-input.text-field.w-input.text-field.positive[id=\'user_address_complement\'][name=\'user[address_complement]\'][type=\'text\']', {
                                                    value: fields.complement(),
                                                    onchange: m.withAttr('value', fields.complement)
                                                })
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
                                            onchange: m.withAttr('value', fields.neighbourhood)
                                        })
                                    ]),
                                    m('.input.string.optional.user_address_city.w-col.w-col-6', [
                                        m('label.field-label',
                                            'Cidade'
                                        ),
                                        m('input.string.optional.w-input.text-field.w-input.text-field.positive[data-required-in-brazil=\'true\'][id=\'user_address_city\'][name=\'user[address_city]\'][type=\'text\']', {
                                            value: fields.city(),
                                            onchange: m.withAttr('value', fields.city)
                                        }),
                                        m('.fontsize-smaller.text-error.u-marginbottom-20.fa.fa-exclamation-triangle.w-hidden[data-error-for=\'user_address_city\']',
                                            ' translation missing: pt.simple_form.validation_texts.user.address_city'
                                        )
                                    ])
                                ]),
                                m('.w-row', [
                                    m('.input.select.optional.user_address_state.w-col.w-col-6.w-sub-col', [
                                        m('label.field-label',
                                            'Estado'
                                        ),
                                        m('select.select.optional.w-input.text-field.w-select.text-field.positive[data-required-in-brazil=\'true\'][id=\'user_address_state\'][name=\'user[address_state]\']', {

                                            onchange: m.withAttr('value', fields.state)
                                        }, [
                                            m('option[value=\'\']'),
                                            (!_.isEmpty(ctrl.states()) ?
                                                _.map(ctrl.states(), (state) => {
                                                    return m(`option[value='${state.acronym}']${state.acronym == fields.state() ? '[selected="selected"]' : ''}`, {
                                                            value: state.acronym
                                                        },
                                                        state.name
                                                    );
                                                })

                                                :
                                                ''),
                                            m('option[value=\'outro / other\']',
                                                'Outro / Other'
                                            )
                                        ]),
                                        m('.fontsize-smaller.text-error.u-marginbottom-20.fa.fa-exclamation-triangle.w-hidden[data-error-for=\'user_address_state\']',
                                            ' translation missing: pt.simple_form.validation_texts.user.address_state'
                                        )
                                    ]),
                                    m('.w-col.w-col-6',
                                        m('.w-row', [
                                            m('.input.tel.optional.user_address_zip_code.w-col.w-col-6.w-col-small-6.w-col-tiny-6.w-sub-col-middle', [
                                                m('label.field-label',
                                                    'CEP'
                                                ),
                                                m('input.string.tel.optional.w-input.text-field.w-input.text-field.positive[data-fixed-mask=\'99999-999\'][data-required-in-brazil=\'true\'][id=\'user_address_zip_code\'][name=\'user[address_zip_code]\'][type=\'tel\']', {
                                                    value: fields.zipcode(),
                                                    onchange: m.withAttr('value', fields.zipcode)
                                                }),
                                                m('.fontsize-smaller.text-error.u-marginbottom-20.fa.fa-exclamation-triangle.w-hidden[data-error-for=\'user_address_zip_code\']',
                                                    ' translation missing: pt.simple_form.validation_texts.user.address_zip_code'
                                                )
                                            ]),
                                            m('.input.tel.optional.user_phone_number.w-col.w-col-6.w-col-small-6.w-col-tiny-6', [
                                                m('label.field-label',
                                                    'Telefone'
                                                ),
                                                m('input.string.tel.optional.w-input.text-field.w-input.text-field.positive[data-fixed-mask=\'(99) 9999-99999\'][data-required-in-brazil=\'true\'][id=\'user_phone_number\'][name=\'user[phone_number]\'][type=\'tel\']', {
                                                    value: fields.phonenumber(),
                                                    onchange: m.withAttr('value', fields.phonenumber),
                                                    onkeyup: m.withAttr('value', (value) => ctrl.applyPhoneMask(value))
                                                })
                                            ])
                                        ])
                                    )
                                ]),
                                m('.divider.u-maginbottom-20'),
                                m('.fontsize-base.fontweight-semibold',
                                    'Alterar minha senha'
                                ),
                                m('.fontsize-small.u-marginbottom-20',
                                    'Para que a senha seja alterada você precisa confirmar a sua senha atual.'
                                ),
                                m('.w-row.u-marginbottom-20', [
                                    m('.w-col.w-col-6.w-sub-col', [
                                        m('label.field-label.fontweight-semibold',
                                            ' Senha atual'
                                        ),
                                        m('input.password.optional.w-input.text-field.w-input.text-field.positive[id=\'user_current_password\'][name=\'user[current_password]\'][type=\'password\']', {
                                            value: fields.current_password(),
                                            onchange: m.withAttr('value', fields.current_password)
                                        })
                                    ]),
                                    m('.w-col.w-col-6', [
                                        m('label.field-label.fontweight-semibold',
                                            ' Nova senha'
                                        ),
                                        m('input.password.optional.w-input.text-field.w-input.text-field.positive[id=\'user_password\'][name=\'user[password]\'][type=\'password\']', {
                                            class: ctrl.passwordHasError() ? 'error' : '',
                                            value: fields.password(),
                                            onfocus: () => ctrl.passwordHasError(false),
                                            onblur: ctrl.validatePassword,
                                            onchange: m.withAttr('value', fields.password)
                                        }),
                                        !ctrl.passwordHasError() ? '' : m(inlineError, {message: 'A sua nova senha deve ter no mínimo 6 caracteres.'})
                                    ])
                                ]),
                                m('.divider.u-marginbottom-20'),
                                m('.fontweight-semibold.fontsize-smaller',
                                    'Desativar minha conta'
                                ),
                                m('.fontsize-smallest',
                                    'Todos os seus apoios serão convertidos em apoios anônimos, seus dados não serão mais visíveis, você sairá automaticamente do sistema e sua conta será desativada permanentemente.'
                                ),
                                m(`a.alt-link.fontsize-smaller[href=\'/pt/users/${user.id}\'][rel=\'nofollow\']`,{
                                        onclick: ctrl.deleteAccount,
                                    },
                                    'Desativar minha conta no Catarse'
                                )
                            ])
                        )
                    ),
                    m('div',
                        m('.w-container',
                            m('.w-row', [
                                m('.w-col.w-col-4.w-col-push-4',
                                    m('input.btn.btn.btn-large[name=\'commit\'][type=\'submit\'][value=\'Salvar\']')
                                ),
                                m('.w-col.w-col-4')
                            ])
                        )
                    )
                ])
            ]),
            m('form.w-hidden', {action: `/pt/users/${user.id}`, method: 'post', config: ctrl.setDeleteForm}, [
                m(`input[name='authenticity_token'][type='hidden'][value='${h.authenticityToken()}']`),
                m('input[name=\'_method\'][type=\'hidden\'][value=\'delete\']')
            ])
        ]);
    }
};

export default userSettings;
