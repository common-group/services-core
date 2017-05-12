import m from 'mithril';
import postgrest from 'mithril-postgrest';
import _ from 'underscore';
import I18n from 'i18n-js';
import h from '../h';
import models from '../models';
import projectDashboardMenu from '../c/project-dashboard-menu';

const I18nScope = _.partial(h.i18nScope, 'projects.reward_fields');

const surveyCreate = {
    controller(args) {
        const
            loader = postgrest.loaderWithToken,
            confirmAddress = h.toggleProp(true, false),
            projectDetails = m.prop([]),
            rewardFilterVM = postgrest.filtersVM({
                id: 'eq'
            }),
            filterVM = postgrest.filtersVM({
                project_id: 'eq'
            }),
            {
                project_id
            } = args;

        rewardFilterVM.id(m.route.param('reward_id'));
        filterVM.project_id(project_id);
        const rewardVM = postgrest.loaderWithToken(models.rewardDetail.getPageOptions(rewardFilterVM.parameters())),
            l = loader(models.projectDetail.getRowOptions(filterVM.parameters()));

        const reward = m.prop([]);
        l.load().then(projectDetails);
        rewardVM.load().then(reward);

        return {
            reward,
            project_id,
            confirmAddress,
            projectDetails
        };
    },
    view(ctrl) {
        const project = _.first(ctrl.projectDetails());
        const reward = _.first(ctrl.reward());
        return (project ? m('.project-surveys',
            (project.is_owner_or_admin ? m.component(projectDashboardMenu, {
                project: m.prop(project)
            }) : ''),
            (reward ?
                m('.card-terciary.section.u-text-center',
                    m('.w-container',
                        m('.w-row', [
                            m('.w-col.w-col-2'),
                            m('.w-col.w-col-8',
                                m('div', [
                                    m('.fontsize-small.fontweight-semibold.u-marginbottom-20',
                                        `Questionário para os ${reward.paid_count} apoiadores da recompensa`
                                    ),
                                    m('.card.u-radius', [
                                        m('.fontsize-large.fontweight-semibold.u-marginbottom-10',
                                            `R$${reward.minimum_value} ou mais${reward.title ? `: ${reward.title}` : ''}`
                                        ),
                                        m('.fontcolor-secondary.fontsize-small.u-marginbottom-20',
                                            `${reward.description.substring(0, 140)}...`
                                        ),
                                        m('.fontcolor-secondary.fontsize-smallest', [
                                            m('span.fontcolor-terciary',
                                                'Entrega prevista:'
                                            ),
                                            m.trust('&nbsp;'),
                                            h.momentify(reward.deliver_at, 'MMMM/YYYY'),
                                            m.trust('&nbsp;'),
                                            ' ',
                                            m.trust('&nbsp;'),
                                            ' ',
                                            m('span.fontcolor-terciary',
                                                '|'
                                            ),
                                            ' ',
                                            m.trust('&nbsp;'),
                                            ' ',
                                            m.trust('&nbsp;'),
                                            ' ',
                                            m('span.fontcolor-terciary',
                                                'Envio:'
                                            ),
                                            m.trust('&nbsp;'),
                                            I18n.t(`shipping_options.${reward.shipping_options}`, I18nScope())
                                        ])
                                    ])
                                ])
                            ),
                            m('.w-col.w-col-2')
                        ])
                    )
                ) : ''),
            m('.divider'),
            m('.section',
                m('.w-row', [
                    m('.w-col.w-col-1'),
                    m('.w-col.w-col-10', [
                        m('.card.card-terciary.medium.u-marginbottom-20.u-text-center', [
                            m('.u-marginbottom-20', [
                                m('.fontsize-base.fontweight-semibold.u-marginbottom-10',
                                    'Confirmar endereço de entrega?'
                                ),
                                m(`a.toggle.toggle-${ctrl.confirmAddress() ? 'on' : 'off'}.w-clearfix.w-inline-block`, {
                                    onclick: ctrl.confirmAddress.toggle
                                },
                                    (ctrl.confirmAddress() ? [
                                        m('.toggle-btn'),
                                        m('.u-right',
                                            'SIM'
                                        )
                                    ] : [
                                        m('div',
                                            'NÃO'
                                        ),
                                        m('.toggle-btn.toggle-btn--off')
                                    ])
                                )
                            ]),
                            m('.w-row', [
                                m('.w-col.w-col-2'),
                                m('.w-col.w-col-8',
                                    m('p.fontcolor-secondary.fontsize-small',
                                        "Se essa recompensa será entregue na casa dos apoiadores, deixe essa opção como 'SIM'. Dessa forma, incluíremos uma pergunta no questionário para que eles confirmem o endereço de entrega."
                                    )
                                ),
                                m('.w-col.w-col-2')
                            ])
                        ]),
                        m('.card.card-terciary.medium.u-marginbottom-20.w-row', [
                            m('.w-sub-col.w-col.w-col-4',
                                m('.text-field.w-dropdown', [
                                    m('.dropdown-toggle.w-dropdown-toggle',
                                        m('div', [
                                            m('span.fa.fa-dot-circle-o',
                                                ''
                                            ),
                                            ' ',
                                            m.trust('&nbsp;'),
                                            'Múltipla escolha',
                                            m('span.fa.fa-chevron-down.u-right')
                                        ])
                                    ),
                                    m('nav.card.dropdown-list.w-dropdown-list', [
                                        m('.dropdown-toggle.w-dropdown-toggle',
                                            m('div', [
                                                m('span.fa.fa-dot-circle-o',
                                                    '.'
                                                ),
                                                ' ',
                                                m.trust('&nbsp;'),
                                                'Múltipla escolha',
                                                m('span.fa.fa-chevron-down.u-right')
                                            ])
                                        ),
                                        m("a.dropdown-link.w-dropdown-link[href='#']", [
                                            m('span.fa.fa-align-left',
                                                '.'
                                            ),
                                            ' ',
                                            m.trust('&nbsp;'),
                                            'Resposta aberta'
                                        ])
                                    ])
                                ])
                            ),
                            m('.w-clearfix.w-col.w-col-8', [
                                m('.card.u-marginbottom-30.u-radius.w-form', [
                                    m("form[data-name='Email Form 2'][id='email-form-2'][name='email-form-2']", [
                                        m('.w-row', [
                                            m('.w-col.w-col-4',
                                                m("label.fontsize-smaller[for='name-3']",
                                                    'Pergunta'
                                                )
                                            ),
                                            m('.w-col.w-col-8',
                                                m("input.positive.text-field.w-input[data-name='Name 3'][id='name-3'][maxlength='256'][name='name-3'][type='text']")
                                            )
                                        ]),
                                        m('.w-row', [
                                            m('.w-col.w-col-4',
                                                m("label.fontsize-smaller[for='name-3']",
                                                    'Descrição'
                                                )
                                            ),
                                            m('.w-col.w-col-8',
                                                m("input.positive.text-field.w-input[data-name='Name 4'][id='name-4'][maxlength='256'][name='name-4'][type='text']")
                                            )
                                        ]),
                                        m('.w-row', [
                                            m('.w-col.w-col-4',
                                                m("label.fontsize-smaller[for='name-3']",
                                                    'Opções'
                                                )
                                            ),
                                            m('.w-col.w-col-8', [
                                                m('.w-row', [
                                                    m('.fa.fa-circle-o.fontcolor-terciary.prefix.u-text-center.w-col.w-col-1.w-col-medium-1.w-col-small-1.w-col-tiny-1'),
                                                    m('.w-col.w-col-10.w-col-medium-10.w-col-small-10.w-col-tiny-10',
                                                        m("input.positive.text-field.w-input[id='field-2'][maxlength='256'][name='field-2'][placeholder='Opção 1'][required='required'][type='text']")
                                                    ),
                                                    m('.w-col.w-col-1.w-col-medium-1.w-col-small-1.w-col-tiny-1')
                                                ]),
                                                m('.w-row', [
                                                    m('.fa.fa-circle-o.fontcolor-terciary.prefix.u-text-center.w-col.w-col-1.w-col-medium-1.w-col-small-1.w-col-tiny-1'),
                                                    m('.w-col.w-col-10.w-col-medium-10.w-col-small-10.w-col-tiny-10',
                                                        m("input.positive.text-field.w-input[data-name='Field 3'][id='field-3'][maxlength='256'][name='field-3'][placeholder='Opção 2'][required='required'][type='text']")
                                                    ),
                                                    m('.w-col.w-col-1.w-col-medium-1.w-col-small-1.w-col-tiny-1',
                                                        m("a.btn.btn-medium.btn-no-border.btn-terciary.fa.fa-trash[href='#']",
                                                            '.'
                                                        )
                                                    )
                                                ]),
                                                m('.w-row', [
                                                    m('.w-col.w-col-1.w-col-medium-1.w-col-small-1.w-col-tiny-1'),
                                                    m('.w-col.w-col-11.w-col-medium-11.w-col-small-11.w-col-tiny-11',
                                                        m("a.fontcolor-secondary.fontsize-smallest.link-hidden[href='#']",
                                                            'Adicionar mais uma opção'
                                                        )
                                                    )
                                                ])
                                            ])
                                        ])
                                    ]),
                                    m('.w-form-done',
                                        m('p',
                                            'Thank you! Your submission has been received!'
                                        )
                                    ),
                                    m('.w-form-fail',
                                        m('p',
                                            'Oops! Something went wrong while submitting the form'
                                        )
                                    )
                                ]),
                                m("a.btn.btn-inline.btn-no-border.btn-small.btn-terciary.fa.fa-lg.fa-trash.u-right[href='#']")
                            ])
                        ]),
                        m('.card.card-terciary.medium.u-marginbottom-20.w-row', [
                            m('._w-sub-col.w-col.w-col-4',
                                m(".text-field.w-dropdown[data-delay='0']", [
                                    m('.dropdown-toggle.w-dropdown-toggle', [
                                        m('div', [
                                            m('span.fa.fa-align-left',
                                                '.'
                                            ),
                                            ' ',
                                            m.trust('&nbsp;'),
                                            'Resposta aberta'
                                        ]),
                                        m('.w-icon-dropdown-toggle')
                                    ]),
                                    m('nav.card.dropdown-list.w-dropdown-list', [
                                        m("a.dropdown-link.w-dropdown-link[href='#']", [
                                            m('span.fa.fa-dot-circle-o',
                                                '.'
                                            ),
                                            ' ',
                                            m.trust('&nbsp;'),
                                            'Múltipla escolha'
                                        ]),
                                        m("a.dropdown-link.w-dropdown-link[href='#']", [
                                            m('span.fa.fa-align-left',
                                                '.'
                                            ),
                                            ' ',
                                            m.trust('&nbsp;'),
                                            'Resposta aberta'
                                        ])
                                    ])
                                ])
                            ),
                            m('.w-col.w-col-8', [
                                m('.card.u-marginbottom-30.u-radius.w-form', [
                                    m("form[data-name='Email Form 2'][id='email-form-2'][name='email-form-2']", [
                                        m('.w-row', [
                                            m('.w-col.w-col-4',
                                                m("label.fontsize-smaller[for='name-3']",
                                                    'Pergunta'
                                                )
                                            ),
                                            m('.w-col.w-col-8',
                                                m("input.positive.text-field.w-input[data-name='Name 5'][id='name-5'][maxlength='256'][name='name-5'][type='text']")
                                            )
                                        ]),
                                        m('.w-row', [
                                            m('.w-col.w-col-4',
                                                m("label.fontsize-smaller[for='name-3']",
                                                    'Descrição'
                                                )
                                            ),
                                            m('.w-col.w-col-8',
                                                m("input.positive.text-field.w-input[data-name='Name 6'][id='name-6'][maxlength='256'][name='name-6'][type='text']")
                                            )
                                        ])
                                    ]),
                                    m('.w-form-done',
                                        m('p',
                                            'Thank you! Your submission has been received!'
                                        )
                                    ),
                                    m('.w-form-fail',
                                        m('p',
                                            'Oops! Something went wrong while submitting the form'
                                        )
                                    )
                                ]),
                                m("a.btn.btn-inline.btn-no-border.btn-small.btn-terciary.fa.fa-lg.fa-trash.u-right[href='#']")
                            ])
                        ]),
                        m("a.btn.btn-large.btn-message[href='#']", [
                            m('span.fa.fa-plus-circle',
                                '.'
                            ),
                            ' ',
                            m.trust('&nbsp;'),
                            'Adicionar pergunta'
                        ])
                    ]),
                    m('.w-col.w-col-1')
                ])
            ),
            m('.section',
                m('.w-container',
                    m('.w-row', [
                        m('.w-col.w-col-4'),
                        m('.w-col.w-col-4',
                            m("a.btn.btn-large[href='/bellum/poll-preview']",
                                'Pré-visualizar'
                            )
                        ),
                        m('.w-col.w-col-4')
                    ])
                )
            )
        ) : h.loader());
    }
};

export default surveyCreate;
