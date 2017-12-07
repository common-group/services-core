import m from 'mithril';
import h from '../h';
import _ from 'underscore';
import { catarse, commonNotification } from '../api';
import models from '../models';
import Liquid from 'liquidjs';

const adminNotifications = {
    controller() {
        const templates = commonNotification.paginationVM(
            models.notificationTemplates, 'label.asc'),
            engine = Liquid(),
            loaderTemp = m.prop(true),
            selectedItem = m.prop(),
            templateDefaultVars = {
                user: {
                    name: 'test name user'
                }
            },
            changeSelectedTo = (collection) => {
                return (evt) => {
                    const item = _.find(collection,  {label: evt.target.value}),
                        tpl = item.template || item.default_template;

                    engine.parseAndRender(tpl, templateDefaultVars)
                        .then((html) => {
                            item.renderedTemplate = html;
                            selectedItem(item);
                            m.redraw();
                        });
                };
            };

        templates.firstPage({}).then(() => { loaderTemp(false); });

        return {
            templates,
            selectedItem,
            changeSelectedTo,
            loaderTemp
        };
    },
    view(ctrl) {
        const templatesCollection = ctrl.templates.collection(),
            selectedItem = ctrl.selectedItem();

        return m('#notifications-admin', [m('.section',
                m('.w-container',
                    m('.w-row', [
                        m('.w-col.w-col-3'),
                        m('.w-col.w-col-6',
                            m('.w-form', [
                                m('form', [
                                    m('.fontsize-larger.u-marginbottom-10.u-text-center',
                                        'Notificações'
                                    ),
                                    (ctrl.loaderTemp() && !_.isEmpty(templatesCollection) ? h.loader() : m(
                                        'select.medium.text-field.w-select', { 
                                            oninput: ctrl.changeSelectedTo(templatesCollection)
                                        }, (() => {
                                            const maped = _.map(
                                                templatesCollection, 
                                                (item) => {
                                                    return m("option", { value: item.label }, item.label);
                                                }
                                            );
                                            maped.unshift(m("option[value='']", 'Selecione uma notificação'));
                                            return maped;
                                        })())
                                    )
                                ])
                            ])
                        ),
                        m('.w-col.w-col-3')
                    ])
                )
            ),
            m('.divider'),
            m('.before-footer.bg-gray.section',
                (selectedItem ? m('.w-container',
                    m('.w-row', [
                        m('.w-col.w-col-6', [
                            m('.fontsize-base.fontweight-semibold.u-marginbottom-20.u-text-center', [
                                m('span.fa.fa-code',
                                    ''
                                ),
                                'HTML'
                            ]),
                            m('.w-form', [
                                m('form', [
                                    m('.u-marginbottom-20.w-row', [
                                        m('.w-col.w-col-2',
                                            m('label.fontsize-small',
                                                'Label'
                                            )
                                        ),
                                        m('.w-col.w-col-10',
                                            m('.fontsize-small',
                                                selectedItem.label
                                            )
                                        )
                                    ]),
                                    m('.w-row', [
                                        m('.w-col.w-col-2',
                                            m('label.fontsize-small',
                                                'Subject'
                                            )
                                        ),
                                        m('.w-col.w-col-10',
                                            m('input.positive.text-field.w-input', {
                                                value: selectedItem.subject || selectedItem.default_subject
                                            })
                                        )
                                    ]),
                                    m('label.fontsize-small', [
                                        'Content',
                                        m('a.alt-link.u-right',
                                            'Ver variáveis'
                                        )
                                    ]),
                                    m('textarea.positive.text-field.w-input',
                                        selectedItem.template|| selectedItem.default_template
                                    )
                                ])
                            ])
                        ]),
                        m('.w-col.w-col-6', [
                            m('.fontsize-base.fontweight-semibold.u-marginbottom-20.u-text-center', [
                                m('span.fa.fa-eye', ''),
                                'Visualização'
                            ]),
                            m('.card.u-radius', m.trust(selectedItem.renderedTemplate))
                        ])
                    ])
                ) : '')
            )
        ]);
    }
};

export default adminNotifications;
