import m from 'mithril';
import _ from 'underscore';
import h from '../h';
import I18n from 'i18n-js';
import userVM from '../vms/user-vm';
import railsErrorsVM from '../vms/rails-errors-vm';
import projectBasicsVM from '../vms/project-basics-vm';
import popNotification from './pop-notification';
import inlineError from './inline-error';
import inputCard from './input-card';
import projectEditSaveBtn from './project-edit-save-btn';

const I18nScope = _.partial(h.i18nScope, 'projects.dashboard_basics');

const projectBasicsEdit = {
    controller(args) {
        const vm = projectBasicsVM,
            mapErrors = [
                  ['name', ['name']],
                  ['public_tags', ['public_tags']],
                  ['permalink', ['permalink']],
                  ['category_id', ['category']],
                  ['city_id', ['city']]
            ],
            loading = m.prop(false),
            cities = m.prop(),
            categories = m.prop([]),
            showSuccess = h.toggleProp(false, true),
            showError = h.toggleProp(false, true),
            onSubmit = (event) => {
                loading(true);
                m.redraw();
                vm.updateProject(args.projectId).then((data) => {
                    loading(false);
                    vm.e.resetFieldErrors();
                    if (!showSuccess()) { showSuccess.toggle(); }
                    if (showError()) { showError.toggle(); }
                    railsErrorsVM.validatePublish();
                }).catch((err) => {
                    if (err.errors_json) {
                        railsErrorsVM.mapRailsErrors(err.errors_json, mapErrors, vm.e);
                    }
                    loading(false);
                    if (showSuccess()) { showSuccess.toggle(); }
                    if (!showError()) { showError.toggle(); }
                });
                return false;
            };
        if (railsErrorsVM.railsErrors()) {
            railsErrorsVM.mapRailsErrors(railsErrorsVM.railsErrors(), mapErrors, vm.e);
        }
        vm.fillFields(args.project);
        vm.loadCategoriesOptionsTo(categories, vm.fields.category_id());

        return {
            vm,
            onSubmit,
            loading,
            categories,
            cities,
            showSuccess,
            showError
        };
    },
    view(ctrl, args) {
        const vm = ctrl.vm;
        return m('#basics-tab', [
            (ctrl.showSuccess() ? m.component(popNotification, {
                message: I18n.t('shared.successful_update'),
                toggleOpt: ctrl.showSuccess
            }) : ''),
            (ctrl.showError() ? m.component(popNotification, {
                message: I18n.t('shared.failed_update'),
                toggleOpt: ctrl.showError,
                error: true
            }) : ''),

            // add pop notifications here
            m('form.w-form', { onsubmit: ctrl.onSubmit }, [
                m('.w-container', [
                    // admin fields
                    (args.user.is_admin ?
                      m('.w-row', [
                          m('.w-col.w-col-10.w-col-push-1', [
                              m(inputCard, {
                                  label: I18n.t('tracker_snippet_html', I18nScope()),
                                  children: [
                                      m('textarea.text.optional.w-input.text-field.positive.medium', {
                                          value: vm.fields.tracker_snippet_html(),
                                          onchange: m.withAttr('value', vm.fields.tracker_snippet_html)
                                      })
                                  ]
                              }),
                              m(inputCard, {
                                  label: I18n.t('user_id', I18nScope()),
                                  children: [
                                      m('input.string.optional.w-input.text-field.positive.medium[type="text"]', {
                                          value: vm.fields.user_id(),
                                          onchange: m.withAttr('value', vm.fields.user_id)
                                      })
                                  ]
                              }),
                              m(inputCard, {
                                  label: 'Admin Tags',
                                  label: I18n.t('admin_tags', I18nScope()),
                                  label_hint: I18n.t('admin_tags_hint', I18nScope()),
                                  children: [
                                      m('input.string.optional.w-input.text-field.positive.medium[type="text"]', {
                                          value: vm.fields.admin_tags(),
                                          onchange: m.withAttr('value', vm.fields.admin_tags)
                                      })
                                  ]
                              }),
                              m(inputCard, {
                                  label: I18n.t('service_fee', I18nScope()),
                                  children: [
                                      m('input.string.optional.w-input.text-field.positive.medium[type="number"]', {
                                          value: vm.fields.service_fee(),
                                          onchange: m.withAttr('value', vm.fields.service_fee)
                                      })
                                  ]
                              })
                          ])
                      ])
                     : ''),
                    m('.w-row', [
                        m('.w-col.w-col-10.w-col-push-1', [
                            m(inputCard, {
                                label: I18n.t('name', I18nScope()),
                                label_hint: I18n.t('name_hint', I18nScope()),
                                children: [
                                    m('input.string.required.w-input.text-field.positive.medium[type="text"][maxlength="50"]', {
                                        value: vm.fields.name(),
                                        class: vm.e.hasError('name') ? 'error' : '',
                                        onchange: m.withAttr('value', vm.fields.name)
                                    }),
                                    vm.e.inlineError('name')
                                ]
                            }),
                            m(inputCard, {
                                label: I18n.t('tags', I18nScope()),
                                label_hint: I18n.t('tags_hint', I18nScope()),
                                children: [
                                    m('input.string.optional.w-input.text-field.positive.medium[type="text"]', {
                                        value: vm.fields.public_tags(),
                                        class: vm.e.hasError('public_tags') ? 'error' : '',
                                        onchange: m.withAttr('value', vm.fields.public_tags)
                                    }),
                                    vm.e.inlineError('public_tags')
                                ]
                            }),
                            m(inputCard, {
                                label: I18n.t('permalink', I18nScope()),
                                label_hint: I18n.t('permalink_hint', I18nScope()),
                                children: [
                                    m('.w-row', [
                                        m('.w-col.w-col-4.w-col-small-6.w-col-tiny6.text-field.prefix.no-hover.medium.prefix-permalink', {
                                            class: vm.e.hasError('permalink') ? 'error' : ''
                                        },
                                          m('.fontcolor-secondary.u-text-center.fontcolor-secondary.u-text-center.fontsize-smallest', 'www.catarse.me/')),
                                        m('.w-col.w-col-8.w-col-small-6.w-col-tiny-6', [
                                            m('input.string.required.w-input.text-field.postfix.positive.medium[type="text"]', {
                                                value: vm.fields.permalink(),
                                                class: vm.e.hasError('permalink') ? 'error' : '',
                                                onchange: m.withAttr('value', vm.fields.permalink)
                                            }),
                                        ]),
                                    ]),
                                    m('.w-row', vm.e.inlineError('permalink'))
                                ]
                            }),
                            m(inputCard, {
                                label: I18n.t('category', I18nScope()),
                                label_hint: I18n.t('category_hint', I18nScope()),
                                children: [
                                    m('select.required.w-input.text-field.w-select.positive.medium', {
                                        value: vm.fields.category_id(),
                                        class: vm.e.hasError('category_id') ? 'error' : '',
                                        onchange: m.withAttr('value', vm.fields.category_id)
                                    }, ctrl.categories()),
                                    vm.e.inlineError('category_id')
                                ]
                            }),
                            m(inputCard, {
                                label: I18n.t('city', I18nScope()),
                                label_hint: I18n.t('city_hint', I18nScope()),
                                children: [
                                    m('input.string.required.w-input.text-field.positive.medium[type="text"]', {
                                        value: vm.fields.city_name(),
                                        class: vm.e.hasError('city_id') ? 'error' : '',
                                        onkeyup: vm.generateSearchCity(ctrl.cities)
                                    }),
                                    vm.e.inlineError('city_id'),
                                    ctrl.cities()
                                ]
                            })
                        ])
                    ])
                ]),
                m(projectEditSaveBtn, { loading: ctrl.loading, onSubmit: ctrl.onSubmit })
            ])
        ]);
    }
};

export default projectBasicsEdit;
