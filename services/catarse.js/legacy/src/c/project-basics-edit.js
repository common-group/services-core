import m from 'mithril';
import prop from 'mithril/stream';
import _ from 'underscore';
import { catarse } from '../api';
import models from '../models';
import h from '../h';
import railsErrorsVM from '../vms/rails-errors-vm';
import projectBasicsVM from '../vms/project-basics-vm';
import popNotification from './pop-notification';
import inputCard from './input-card';
import projectEditSaveBtn from './project-edit-save-btn';

const I18nScope = _.partial(h.i18nScope, 'projects.dashboard_basics');

const projectBasicsEdit = {
    oninit: function(vnode) {
        const vm = projectBasicsVM,
            mapErrors = [
                  ['name', ['name']],
                  ['public_tags', ['public_tags']],
                  ['permalink', ['permalink']],
                  ['category_id', ['category']],
                  ['city_id', ['city']]
            ],
            loading = prop(false),
            cities = prop(),
            categories = prop([]),
            showSuccess = h.toggleProp(false, true),
            showError = h.toggleProp(false, true),
            selectedTags = prop([]),
            tagOptions = prop([]),
            isEditingTags = prop(false),
            tagEditingLoading = prop(false),
            onSubmit = () => {
                if (isEditingTags()) {
                    return false;
                }

                loading(true);
                m.redraw();
                const tagString = _.pluck(selectedTags(), 'name').join(',');
                vm.fields.public_tags(tagString);
                vm.updateProject(vnode.attrs.projectId).then(() => {
                    loading(false);
                    vm.e.resetFieldErrors();
                    showSuccess(true);
                    showError(false);
                }).catch((err) => {
                    if (err.errors_json) {
                        railsErrorsVM.mapRailsErrors(err.errors_json, mapErrors, vm.e);
                    }
                    loading(false);
                    showSuccess(false);
                    showError(true);
                });

                return false;
            };
        if (railsErrorsVM.railsErrors()) {
            railsErrorsVM.mapRailsErrors(railsErrorsVM.railsErrors(), mapErrors, vm.e);
        }
        vm.fillFields(vnode.attrs.project);

        if (vm.fields.public_tags()) {
            selectedTags(_.map(vm.fields.public_tags().split(','), name => ({ name })));
        }

        vm.loadCategoriesOptionsTo(categories, vm.fields.category_id());
        const addTag = tag => () => {
            tagOptions([]);

            if (selectedTags().length >= 5) {
                vm.e('public_tags', window.I18n.t('tags_max_error', I18nScope()));
                vm.e.inlineError('public_tags', true);
                m.redraw();

                return false;
            }
            selectedTags().push(tag);
            isEditingTags(false);

            m.redraw();

            return false;
        };

        const removeTag = tagToRemove => () => {
            const updatedTags = _.reject(selectedTags(), tag => tag === tagToRemove);

            selectedTags(updatedTags);

            return false;
        };
        const tagString = prop('');
        const transport = prop({ abort: Function.prototype });
        const searchTagsUrl = `${h.getApiHost()}/rpc/tag_search`;
        const searchTags = () => m.request({ method: 'POST', background: true, config: transport, data: { query: tagString(), count: 3 }, url: searchTagsUrl });
        const triggerTagSearch = (e) => {
            tagString(e.target.value);

            isEditingTags(true);
            tagOptions([]);

            const keyCode = e.keyCode;

            if (keyCode === 188 || keyCode === 13) {
                const tag = tagString().charAt(tagString().length - 1) === ','
                    ? tagString().substr(0, tagString().length - 1)
                    : tagString();

                addTag({ name: tag.toLowerCase() }).call();
                e.target.value = '';
                return false;
            }

            tagEditingLoading(true);
            transport().abort();
            searchTags().then((data) => {
                tagOptions(data);
                tagEditingLoading(false);
                m.redraw(true);
            });

            return false;
        };

        const editTag = (el, isinit) => {
            if (!isinit) {
                el.onkeyup = triggerTagSearch;
            }
        };

        return {
            vm,
            onSubmit,
            loading,
            categories,
            cities,
            showSuccess,
            showError,
            tagOptions,
            editTag,
            addTag,
            removeTag,
            isEditingTags,
            triggerTagSearch,
            selectedTags,
            tagEditingLoading
        };
    },
    view: function(ctrl, args) {
        const vm = ctrl.vm;

        return m('#basics-tab', [
            (ctrl.showSuccess() ? m(popNotification, {
                message: window.I18n.t('shared.successful_update'),
                toggleOpt: ctrl.showSuccess
            }) : ''),
            (ctrl.showError() ? m(popNotification, {
                message: window.I18n.t('shared.failed_update'),
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
                                  label: window.I18n.t('tracker_snippet_html', I18nScope()),
                                  children: [
                                      m('textarea.text.optional.w-input.text-field.positive.medium', {
                                          value: vm.fields.tracker_snippet_html(),
                                          onchange: m.withAttr('value', vm.fields.tracker_snippet_html)
                                      })
                                  ]
                              }),
                              m(inputCard, {
                                  label: window.I18n.t('user_id', I18nScope()),
                                  children: [
                                      m('input.string.optional.w-input.text-field.positive.medium[type="text"]', {
                                          value: vm.fields.user_id(),
                                          onchange: m.withAttr('value', vm.fields.user_id)
                                      })
                                  ]
                              }),
                              m(inputCard, {
                                  label: window.I18n.t('admin_tags', I18nScope()),
                                  label_hint: window.I18n.t('admin_tags_hint', I18nScope()),
                                  children: [
                                      m('input.string.optional.w-input.text-field.positive.medium[type="text"]', {
                                          value: vm.fields.admin_tags(),
                                          onchange: m.withAttr('value', vm.fields.admin_tags)
                                      })
                                  ]
                              }),
                              m(inputCard, {
                                  label: window.I18n.t('service_fee', I18nScope()),
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
                                label: window.I18n.t('name', I18nScope()),
                                label_hint: window.I18n.t('name_hint', I18nScope()),
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
                                label: window.I18n.t('tags', I18nScope()),
                                label_hint: window.I18n.t('tags_hint', I18nScope()),
                                onclick: () => ctrl.isEditingTags(false),
                                children: [
                                    m('input.string.optional.w-input.text-field.positive.medium[type="text"]', {
                                        config: ctrl.editTag,
                                        class: vm.e.hasError('public_tags') ? 'error' : '',
                                        onfocus: () => vm.e.inlineError('public_tags', false)
                                    }),
                                    ctrl.isEditingTags() ? m('.options-list.table-outer',
                                         ctrl.tagEditingLoading()
                                            ? m('.dropdown-link', m('.fontsize-smallest', 'Carregando...'))
                                            : ctrl.tagOptions().length
                                                ? _.map(ctrl.tagOptions(), tag => m('.dropdown-link',
                                                    { onclick: ctrl.addTag(tag) },
                                                    m('.fontsize-smaller', tag.name)
                                                ))
                                                : m('.dropdown-link', m('.fontsize-smallest', 'Nenhuma tag relacionada...'))
                                    ) : '',
                                    vm.e.inlineError('public_tags'),
                                    m('div.tag-choices',
                                        _.map(ctrl.selectedTags(), choice => m('.tag-div',
                                            m('div', [
                                                m('a.tag-close-btn.fa.fa-times-circle', { onclick: ctrl.removeTag(choice) }),
                                                ` ${choice.name}`
                                            ]))
                                        )
                                    )
                                ]
                            }),
                            m(inputCard, {
                                label: window.I18n.t('permalink', I18nScope()),
                                label_hint: window.I18n.t('permalink_hint', I18nScope()),
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
                                label: window.I18n.t('category', I18nScope()),
                                label_hint: window.I18n.t('category_hint', I18nScope()),
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
                                label: window.I18n.t('city', I18nScope()),
                                label_hint: window.I18n.t('city_hint', I18nScope()),
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
