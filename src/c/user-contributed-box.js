import m from 'mithril';
import _ from 'underscore';
import h from '../h';
import contributionVM from '../vms/contribution-vm';
import userVM from '../vms/user-vm';
import loadMoreBtn from './load-more-btn';

const I18nScope = _.partial(h.i18nScope, 'payment.state');

const userContributedBox = {
    controller(args) {
        const confirmDelivery = (projectId, contribution) => {
                userVM.confirmDelivery(projectId, contribution).then(
                    contribution.delivery_status = 'received' //so we don't have to reload the page
                );
            };
        return {
            toggleAnonymous: userVM.toggleAnonymous,
            confirmDelivery: confirmDelivery
        };
    },
    view(ctrl, args) {
        let collection = args.collection,
            pagination = args.pagination,
            title = args.title;
        return (!_.isEmpty(collection) ? m('.section-one-column.u-marginbottom-30', [
            m('.fontsize-large.fontweight-semibold.u-marginbottom-30.u-text-center',
                title
            ),
            m('.w-row.w-hidden-small.w-hidden-tiny.card.card-secondary', [
                m('.w-col.w-col-3',
                    m('.fontsize-small.fontweight-semibold',
                        'Projetos que apoiei'
                    )
                ),
                m('.w-col.w-col-2',
                    m('.fontsize-small.fontweight-semibold',
                        'Valor do apoio'
                    )
                ),
                m('.w-col.w-col-3',
                    m('.fontsize-small.fontweight-semibold',
                        'Status do apoio'
                    )
                ),
                m('.w-col.w-col-4',
                    m('.fontsize-small.fontweight-semibold',
                        'Recompensa'
                    )
                )
            ]),

            _.map(collection, (contribution) => {
                return m('.w-row.card', [
                    m('.w-col.w-col-3',
                        m('.w-row', [
                            m('.w-col.w-col-4.u-marginbottom-10',
                                m(`a[href='/${contribution.permalink}']`,
                                    m(`img.thumb-project.u-radius[alt='${contribution.project_name}'][src='${contribution.project_image}'][width='50']`)
                                )
                            ),
                            m('.w-col.w-col-8',
                                m('.fontsize-small.fontweight-semibold',
                                    m(`a.alt-link[href='/${contribution.permalink}']`,
                                        contribution.project_name
                                    )
                                )
                            )
                        ])
                    ),
                    m('.w-col.w-col-2.u-marginbottom-10',
                        m('.fontsize-base.inline-block', [
                            m('span.w-hidden-main.w-hidden-medium.fontweight-semibold',
                                'Valor do apoio'
                            ),
                            ` R$ ${contribution.value}`
                        ])
                    ),
                    m('.w-col.w-col-3.u-marginbottom-10', [
                        m('.w-hidden-main.w-hidden-medium.fontsize-smallest.fontweight-semibold',
                            'Status'
                        ),

                        m('.fontsize-smaller.fontweight-semibold', [
                            m('.lineheight-tighter'),
                            m(`span.fa.fa-circle.fontsize-smallest.${contribution.state == 'paid' ? 'text-success' : contribution.state == 'pending' ? 'text-waiting' : 'text-error'}`,
                                m.trust('&nbsp;')
                            ),
                            I18n.t(contribution.state, I18nScope({
                                date: h.momentify(contribution[contribution.state + '_at'])
                            }))
                        ]),
                        m('.fontsize-smallest',
                            (contribution.installments > 1 ? (`${contribution.installments} x R$ ${contribution.installment_value} `) : ''),
                            (contribution.payment_method == 'BoletoBancario' ? 'Boleto Bancário' : 'Cartão de Crédito')
                        ),

                        (contributionVM.canShowReceipt(contribution) ?
                            m(`a.btn.btn-inline.btn-small.u-margintop-10.btn-terciary[href='https://www.catarse.me/pt/projects/${contribution.project_id}/contributions/${contribution.contribution_id}/receipt'][target='__blank']`,
                                'Ver recibo'
                            ) : ''),

                        (contributionVM.canShowSlip(contribution) ?
                            m(`a.btn.btn-inline.btn-small.u-margintop-10[href='${contribution.gateway_data['boleto_url']}'][target='__blank']`,
                                'Imprimir boleto'
                            ) : ''),

                        (contributionVM.canGenerateSlip(contribution) ?
                            m(`a.btn.btn-inline.btn-small.u-margintop-10[href='https://www.catarse.me/pt/projects/${contribution.project_id}/contributions/${contribution.contribution_id}/second_slip'][target='__blank']`,
                                'Gerar 2a via'
                            ) : ''),

                        m('.w-checkbox.fontsize-smallest.fontcolor-secondary.u-margintop-10', [
                            m(`input.w-checkbox-input[id='anonymous'][name='anonymous'][type='checkbox']${contribution.anonymous ? '[checked=\'checked\']' : ''}[value='1']`, {
                                onclick: () => ctrl.toggleAnonymous(contribution.project_id, contribution)
                            }),
                            m('label.w-form-label',
                                'Quero que meu apoio não seja público'
                            )
                        ])
                    ]),
                    m('.w-col.w-col-3',
                        m('.fontsize-smallest', [
                            m('span.w-hidden-main.w-hidden-medium.fontweight-semibold',
                                'Recompensa'
                            ),
                            (contribution.reward_id ? m.trust(h.simpleFormat(contribution.reward_description)) : ' Não selecionou recompensa')

                        ]),

                        m('.fontsize-smallest.lineheight-looser', [
                            m('span.fontweight-semibold',
                                'Estimativa de entrega: '
                            ),
                            h.momentify(contribution.deliver_at, 'MMMM/YYYY')
                        ])
                    ),
                    m('.u-text-center.w-col.w-col-1', {
                        onclick: () => ctrl.confirmDelivery(contribution.project_id, contribution)
                    }, [
                        m('.fontsize-smallest',
                            m(`a.checkbox-big${contribution.delivery_status == 'received' ? '.checkbox--selected.fa.fa-check.fa-lg' : ''}`,
                                ''
                            )
                        ),
                        m('.fontcolor-secondary.fontsize-smallest.lineheight-looser',
                            'Recebi!'
                        )
                    ])

                ]);
            }),
            m('.w-row.u-marginbottom-40.u-margintop-30', [
                m(loadMoreBtn, {
                    collection: pagination,
                    cssClass: '.w-col-push-5'
                })
            ])
        ]) : m('div', ''));
    }
};

export default userContributedBox;
