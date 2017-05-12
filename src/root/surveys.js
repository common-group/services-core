import m from 'mithril';
import postgrest from 'mithril-postgrest';
import _ from 'underscore';
import I18n from 'i18n-js';
import h from '../h';
import models from '../models';
import projectDashboardMenu from '../c/project-dashboard-menu';
import rewardVM from '../vms/reward-vm';

const I18nScope = _.partial(h.i18nScope, 'projects.reward_fields');

const surveys = {
    controller(args) {
        const loader = postgrest.loaderWithToken,
            filterVM = postgrest.filtersVM({
                project_id: 'eq'
            }),
            {
                project_id
            } = args,
            projectDetails = m.prop([]);

        filterVM.project_id(project_id);
        const l = loader(models.projectDetail.getRowOptions(filterVM.parameters()));

        rewardVM.fetchRewards(project_id);
        l.load().then(projectDetails);

        return {
            l,
            project_id,
            rewardVM,
            projectDetails,
        };
    },
    view(ctrl) {
        const project = _.first(ctrl.projectDetails());
        const availableAction = (reward) => {
            const canBeCreated = !reward.survey_sent_at && ((reward.maximum_contributions && (reward.paid_count >= reward.maximum_contributions)) || project.state !== 'online');
            const cannotBeCreated = !reward.survey_sent_at && project.state === 'online' && (!reward.maximum_contributions || (reward.paid_count < reward.maximum_contributions));
            if (canBeCreated) {
                return m('.w-col.w-col-3.w-col-small-small-stack.w-col-tiny-tiny-stack',
                    m('a.btn.btn-small.w-button', {
                        onclick: () => m.route(`/projects/${ctrl.project_id}/rewards/${reward.id}/surveys/new`)
                    },
                        'Criar questionário'
                    )
                );
            } else if (cannotBeCreated) {
                return m('.w-col.w-col-3.w-col-small-3.w-col-tiny-tiny-stack',
                    m('a.btn.btn-desactivated.btn-small.btn-terciary.w-button',
                        'Criar questionário'
                    )
                );
            } else if (reward.survey_sent_at && !reward.survey_finished_at) {
                return m('.w-clearfix.w-col.w-col-3.w-col-small-3.w-col-tiny-3',
                    m('.u-right.w-clearfix', [
                        m('.fontcolor-secondary.fontsize-smallest.lineheight-tighter.u-marginbottom-10',
                            'Aceitando respostas?'
                        ),
                        m('.u-marginbottom-10.w-clearfix',
                            m('a.toggle.toggle-on.u-right.w-clearfix.w-inline-block', [
                                m('.toggle-btn'),
                                m('.u-right',
                                    'SIM'
                                )
                            ])
                        ),
                        m('.u-right', [
                            m('.fontcolor-secondary.fontsize-mini.lineheight-tighter',
                                'Enviado em:'
                            ),
                            m('.fontcolor-secondary.fontsize-mini.lineheight-tighter',
                                h.momentify(reward.survey_sent_at, 'DD/MM/YYYY')
                            )
                        ])
                    ])
                );
            }

            return m('.w-clearfix.w-col.w-col-3.w-col-small-3.w-col-tiny-3',
                m('.u-right', [
                    m('.fontcolor-secondary.fontsize-smallest.lineheight-tighter.u-marginbottom-10',
                        'Aceitando respostas?'
                    ),
                    m('.u-marginbottom-10.w-clearfix',
                        m('a.toggle.toggle-off.u-right.w-inline-block', [
                            m('div',
                                'NÃO'
                            ),
                            m('.toggle-btn.toggle-btn--off')
                        ])
                    ),
                    m('.u-right', [
                        m('.fontcolor-secondary.fontsize-mini.lineheight-tighter',
                            'Finalizado em:'
                        ),
                        m('.fontcolor-secondary.fontsize-mini.lineheight-tighter',
                            h.momentify(reward.survey_finished_at, 'DD/MM/YYYY')
                        )
                    ])
                ])
            );
        };

        return (project ? m('.project-surveys',
            (project.is_owner_or_admin ? m.component(projectDashboardMenu, {
                project: m.prop(project)
            }) : ''),
            m('.section',
                m('.w-container',
                    m('.w-row', [
                        m('.w-col.w-col-2'),
                        m('.w-col.w-col-8', [
                            m('.fontsize-larger.fontweight-semibold.lineheight-looser.u-text-center',
                                'Questionários'
                            ),
                            m('.fontsize-base.u-text-center',
                                'Confirme o endereço de entrega dos seus apoiadores e faça outras perguntas relacionadas às suas recompensas'
                            )
                        ]),
                        m('.w-col.w-col-2')
                    ])
                )
            ),
            m('.divider'),
            m('.before-footer.bg-gray.section',
                m('.w-container', [
                    (project.state === 'online' ?
                        m('.w-row', [
                            m('.w-col.w-col-2'),
                            m('.w-col.w-col-8',
                                m('.card.card-message.u-marginbottom-40.u-radius',
                                    m('.fontsize-base', [
                                        m('span.fa.fa-exclamation-circle',
                                            ''
                                        ),
                                        ' Como o seu projeto ainda não foi finalizado, você só pode enviar questionários para apoiadores de recompensas esgotadas. Após a finalização do projeto, você poderá enviar questionários a todos os apoiadores.'
                                    ])
                                )
                            ),
                            m('.w-col.w-col-2')
                        ]) : ''),
                    m('.table-outer.u-marginbottom-60', [
                        m('.fontweight-semibold.header.table-row.w-hidden-small.w-hidden-tiny.w-row', [
                            m('.table-col.w-col.w-col-3',
                                m('div',
                                    'Recompensa'
                                )
                            ),
                            m('.table-col.w-col.w-col-9',
                                m('.w-row', [
                                    m('.u-text-center-big-only.w-col.w-col-4.w-col-small-4.w-col-tiny-4',
                                        m('.w-row', [
                                            m('.w-col.w-col-6',
                                                m('div',
                                                    'Enviados'
                                                )
                                            ),
                                            m('.w-col.w-col-6',
                                                m('div',
                                                    'Respondidos'
                                                )
                                            )
                                        ])
                                    ),
                                    m('.u-text-center-big-only.w-col.w-col-5.w-col-small-5.w-col-tiny-5',
                                        m('div',
                                            'Resultados'
                                        )
                                    ),
                                    m('.w-clearfix.w-col.w-col-3.w-col-small-3.w-col-tiny-3',
                                        m('.u-right')
                                    )
                                ])
                            )
                        ]),
                        m('.fontsize-small.table-inner', [
                            (_.map(ctrl.rewardVM.rewards(), reward =>
                                m('.table-row.w-row', [
                                    m('.table-col.w-col.w-col-3', [
                                        m('.fontsize-base.fontweight-semibold',
                                            `R$ ${reward.minimum_value} ou mais`
                                        ),
                                        m('.fontsize-smallest.fontweight-semibold',
                                            reward.title
                                        ),
                                        m('.fontcolor-secondary.fontsize-smallest.u-marginbottom-10',
                                            `${reward.description.substring(0, 90)}...`
                                        ),
                                        m('.fontcolor-secondary.fontsize-smallest', [
                                            m('span.fontcolor-terciary',
                                                'Entrega prevista:'
                                            ),
                                            m.trust('&nbsp;'),
                                            h.momentify(reward.deliver_at, 'MMMM/YYYY')
                                        ]),
                                        m('.fontcolor-secondary.fontsize-smallest', [
                                            m('span.fontcolor-terciary',
                                                'Envio:'
                                            ),
                                            m.trust('&nbsp;'),
                                            I18n.t(`shipping_options.${reward.shipping_options}`, I18nScope())
                                        ])
                                    ]),
                                    m('.table-col.w-col.w-col-9',
                                        m('.u-margintop-20.w-row', [
                                            m('.u-text-center-big-only.w-col.w-col-4.w-col-small-4.w-col-tiny-4',
                                                m('.w-row', [
                                                    m('.w-col.w-col-6',
                                                        m('.fontsize-base', [
                                                            m('span.fa.fa-paper-plane.fontcolor-terciary',
                                                                '.'
                                                            ),
                                                            ' 200'
                                                        ])
                                                    ),
                                                    m('.w-col.w-col-6',
                                                        m('.fontsize-base', [
                                                            m('span.fa.fa-check-circle.fontcolor-terciary',
                                                                '.'
                                                            ),
                                                            ' 30 ',
                                                            m('span.fontcolor-secondary',
                                                                '(15%)'
                                                            )
                                                        ])
                                                    )
                                                ])
                                            ),
                                            m('.u-text-center-big-only.w-col.w-col-5.w-col-small-5.w-col-tiny-5', [
                                                m('a.btn.btn-inline.btn-small.btn-terciary.fa.fa-eye.fa-lg.u-marginright-10.w-button'),
                                                m("a.btn.btn-inline.btn-small.btn-terciary.fa.fa-download.fa-lg.w-button[href='#']")
                                            ]),
                                            availableAction(reward)
                                        ])
                                    )
                                ])))
                        ])
                    ])
                ])
            )) : h.loader());
    }
};

export default surveys;
