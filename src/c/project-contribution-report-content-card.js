import m from 'mithril';
import _ from 'underscore';
import $ from 'jquery';
import h from '../h';

const projectContributionReportContentCard = {
    controller(args) {
        const project = args.project(),
            checked = contribution => _.contains(args.selectedContributions(), contribution.id),
            selectContribution = (contribution) => {
                const anyChecked = $('input:checkbox').is(':checked');

                args.selectedAny(anyChecked);
                if (!checked(contribution)) {
                    args.selectedContributions().push(contribution.id);
                } else {
                    args.selectedContributions(_.without(args.selectedContributions(), contribution.id));
                }
                return true;
            },
            stateClass = (state) => {
                const classes = {
                    online: {
                        paid: 'text-success.fa-circle',
                        refunded: 'text-error.fa-circle',
                        pending_refund: 'text-error.fa-circle',
                        pending: 'text-waiting.fa-circle',
                        refused: 'text-error.fa-circle'
                    },
                    failed: {
                        paid: 'text-error.fa-circle-o',
                        refunded: 'text-refunded.fa-circle',
                        pending_refund: 'text-refunded.fa-circle-o',
                        pending: 'text-refunded',
                        refused: 'text-refunded'
                    },
                    waiting_funds: {
                        paid: 'text-success.fa-circle',
                        refunded: 'text-error.fa-circle',
                        pending_refund: 'text-error.fa-circle',
                        pending: 'text-waiting.fa-circle',
                        refused: 'text-error.fa-circle'
                    },
                    successful: {
                        paid: 'text-success.fa-circle',
                        refunded: 'text-error.fa-circle',
                        pending_refund: 'text-error.fa-circle',
                        pending: 'text-waiting.fa-circle',
                        refused: 'text-error.fa-circle'
                    }
                };

                return classes[project.state][state];
            };

        return {
            stateClass,
            checked,
            selectContribution
        };
    },
    view(ctrl, args) {
        const contribution = args.contribution(),
            project = args.project(),
            profileImg = (_.isEmpty(contribution.profile_img_thumbnail) ? '/assets/catarse_bootstrap/user.jpg' : contribution.profile_img_thumbnail),
            reward = contribution.reward || {
                minimum_value: 0,
                description: 'Nenhuma recompensa selecionada'
            };

        return m(`.w-clearfix.card${ctrl.checked(contribution) ? '.card-alert' : ''}`, [
            m('.w-row', [
                m('.w-col.w-col-1.w-col-small-1.w-col-tiny-1',
                    m('.w-inline-block',
                        m('.w-checkbox.w-clearfix',
                            (contribution.delivery_status !== 'received' && project.state !== 'failed' ?
                            m('input.w-checkbox-input[type=\'checkbox\']', {
                                checked: ctrl.checked(contribution),
                                value: contribution.id,
                                onclick: () => ctrl.selectContribution(contribution)
                            }) : '')
                        )
                    )
                ),
                m('.w-col.w-col-11.w-col-small-11.w-col-tiny-11',
                    m('.w-row', [
                        m('.w-col.w-col-1.w-col-tiny-1', [
                            m(`img.user-avatar.u-marginbottom-10[src='${profileImg}']`)
                        ]),
                        m('.w-col.w-col-11.w-col-tiny-11', [
                            m('.w-row', [
                                m('.w-col.w-col-3', [
                                    m('.fontcolor-secondary.fontsize-mini.fontweight-semibold', h.momentify(contribution.created_at, 'DD/MM/YYYY, HH:mm')),
                                    m('.fontweight-semibold.fontsize-smaller.lineheight-tighter', contribution.user_name),
                                    m('.fontsize-smallest.lineheight-looser', [
                                        (contribution.has_another ? [
                                            m('a.link-hidden-light.badge.badge-light', '+1 apoio '),
                                        ] : ''),
                                        (contribution.anonymous ? m('span.fa.fa-eye-slash.fontcolor-secondary', m('span.fontcolor-secondary[style="font-size:11px;"]', ' Apoio não-público')) : '')
                                    ]),
                                    m('.fontsize-smallest.lineheight-looser', (contribution.email))
                                ]),
                                m('.w-col.w-col-3', [
                                    m('.lineheight-tighter', [
                                        m(`span.fa.fontsize-smallest.${ctrl.stateClass(contribution.state)}`),
                                        '   ',
                                        m('span.fontsize-large', `R$ ${h.formatNumber(contribution.value, 2, 3)}`)
                                    ])
                                ]),
                                m('.w-col.w-col-3.w-hidden-small.w-hidden-tiny', [
                                    m('div',
                                        (contribution.delivery_status === 'error' ?
                                            m('span.badge.badge-attention.fontsize-smaller',
                                                'Erro no envio'
                                            ) : contribution.delivery_status === 'delivered' ?
                                            m('span.badge.badge-success.fontsize-smaller',
                                                'Enviada'
                                            ) : contribution.delivery_status === 'received' ?
                                            m('span.fontsize-smaller.badge.badge-success', [
                                                m('span.fa.fa-check-circle',
                                                    ''
                                                ),
                                                ' Recebida'
                                            ]) : '')
                                    ),
                                    m('.fontsize-smallest.fontweight-semibold', `Recompensa: R$ ${h.formatNumber(reward.minimum_value, 2, 3)}`),
                                    m('.fontsize-smallest', `${reward.description.substring(0, 80)}...`)
                                ])
                            ])
                        ])
                    ])
                )
            ])

        ]);
    }
};

export default projectContributionReportContentCard;
