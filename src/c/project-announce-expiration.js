import m from 'mithril';
import moment from 'moment';
import h from '../h';
import modalBox from './modal-box';
import announceExpirationModal from './announce-expiration-modal';

const projectAnnounceExpiration = {
    controller() {
        const days = m.prop(2),
            showModal = h.toggleProp(false, true);
        return {
            days,
            showModal
        };
    },
    view(ctrl, args) {
        const days = ctrl.days,
            expirationDate = moment().add(ctrl.days(), 'days').format('DD/MM/YYYY');
        return m("[id='dashboard-announce_expiration-tab']",
            m(`form.simple_form.project-form.w-form[accept-charset='UTF-8'][action='/pt/flexible_projects/${args.project_id}'][id='expiration-form'][method='post'][novalidate='novalidate']`, [
                m("input[name='utf8'][type='hidden'][value='✓']"),
                m("input[name='_method'][type='hidden'][value='patch']"),
                m(`input[name='authenticity_token'][type='hidden'][value='${h.authenticityToken()}']`),
                m('.w-section',
                    m('.w-container',
                        m('.w-row.u-marginbottom-60', [
                            m('.w-col.w-col-1'),
                            m('.w-col.w-col-10',
                                m('.card-big.card.card-terciary.u-radius', [
                                    m('.u-marginbottom-30.w-row', [
                                        m('.w-sub-col.w-col.w-col-6',
                                            m('.fontsize-small.u-marginbottom-10', [
                                                'Em quantos dias, contados a partir de agora, você quer encerrar a sua arrecadação?',
                                                m('br'),
                                                m('span.fontsize-smaller.fontweight-semibold',
                                                    '(mínimo de 2 dias)'
                                                )
                                            ])
                                        ),
                                        m('.w-col.w-col-6',
                                            m('.w-row', [
                                                m('.w-col.w-col-8.w-col-small-6.w-col-tiny-6',

                                                    m("input.numeric.numeric.optional.w-input.text-field.positive.medium[id='flexible_project_online_days'][step='any'][type='number']",
                                                        {
                                                            name: 'flexible_project[online_days]',
                                                            value: days(),
                                                            onchange: m.withAttr('value', ctrl.days)
                                                        }
                                                    )

                                                ),
                                                m('.medium.no-hover.postfix.prefix-permalink.text-field.w-col.w-col-4.w-col-small-6.w-col-tiny-6',
                                                    m('.fontcolor-secondary.fontsize-base.lineheight-tightest.u-text-center',
                                                        'Dias'
                                                    )
                                                )
                                            ])
                                        )
                                    ]),
                                    m('.fontcolor-secondary.u-text-center', [
                                        m('.fontsize-smaller',
                                            'Você poderá receber apoios até:'
                                        ),
                                        m('.fontsize-base', [
                                            m('span.expire-date',
                                                expirationDate
                                            ),
                                            ' as 23h59m'
                                        ])
                                    ])
                                ])
                            ),
                            m('.w-col.w-col-1')
                        ])
                    )
                ),
                m('.w-section',
                    m('.w-container',
                        m('.w-row', [
                            m('.w-col.w-col-4'),
                            m('.w-col.w-col-4',
                                m('button.btn.btn-large.u-marginbottom-20', {
                                    onclick: (e) => {
                                        ctrl.showModal.toggle();
                                        e.preventDefault();
                                    }
                                },
                                    '  Confirmar'
                                )
                            )
                        ])
                    )
                ),

                (ctrl.showModal() ? m.component(modalBox, {
                    displayModal: ctrl.showModal,
                    content: [announceExpirationModal, {
                        expirationDate,
                        displayModal: ctrl.showModal
                    }]
                }) : '')
            ])
        );
    }
};

export default projectAnnounceExpiration;
