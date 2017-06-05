import m from 'mithril';
import _ from 'underscore';

const surveyPreview = {
    controller(args) {
        const fields = args.fields,
            multipleChoiceQuestions = args.multipleChoiceQuestions,
            openQuestions = args.openQuestions;

        return {
            fields,
            multipleChoiceQuestions,
            openQuestions
        };
    },
    view(ctrl, args) {
        return m('.section.u-marginbottom-40',
            m('.w-container',
                m('.w-row', [
                    m('.w-col.w-col-1'),
                    m('.w-col.w-col-10',
                        m('.card.card-terciary.medium.u-radius', [
                            m('.u-marginbottom-30', [
                                m('.fontcolor-secondary.fontsize-base.fontweight-semibold.u-marginbottom-20',
                                    'Endereço de entrega'
                                ),
                                m('.fontsize-base', [
                                    m('span.fontweight-semibold',
                                        'País: '
                                    ),
                                    args.countryName,
                                    m('br'),
                                    m('span.fontweight-semibold',
                                        'Endereço:'
                                    ),
                                    m.trust('&nbsp;'),
                                    ctrl.fields().address_attributes.address_street,
                                    m('br'),
                                    m('span.fontweight-semibold',
                                        'Número:'
                                    ),
                                    m.trust('&nbsp;'),
                                    ctrl.fields().address_attributes.address_number,
                                    m('br'),
                                    m('span.fontweight-semibold',
                                        'Complemento:'
                                    ),
                                    m.trust('&nbsp;'),
                                    ctrl.fields().address_attributes.address_complement,
                                    m('br'),
                                    m('span.fontweight-semibold',
                                        'Bairro:'
                                    ),
                                    m.trust('&nbsp;'),
                                    ctrl.fields().address_attributes.address_neighbourhood,
                                    m('br'),
                                    m('span.fontweight-semibold',
                                        'Cidade:'
                                    ),
                                    m.trust('&nbsp;'),
                                    ctrl.fields().address_attributes.address_city,
                                    m('br'),
                                    m('span.fontweight-semibold',
                                        'Estado:'
                                    ),
                                    m.trust('&nbsp;'),
                                    args.stateName,
                                    m('br'),
                                    m('span.fontweight-semibold',
                                        'CEP:'
                                    ),
                                    m.trust('&nbsp;'),
                                    ctrl.fields().address_attributes.address_zip_code,
                                    m('br'),
                                    m('span.fontweight-semibold',
                                        'Telefone:'
                                    ),
                                    m.trust('&nbsp;'),
                                    ctrl.fields().address_attributes.phone_number
                                ])
                            ]),
                            _.map(ctrl.multipleChoiceQuestions, item =>
                                m('.u-marginbottom-30', [
                                    m('.fontcolor-secondary.fontsize-base.fontweight-semibold.u-marginbottom-20',
                                        item.question.question
                                    ), _.find(item.question.question_choices, choice => item.value() == choice.id).option
                                ])),
                            _.map(ctrl.openQuestions, item =>
                                m('.u-marginbottom-30', [
                                    m('.fontcolor-secondary.fontsize-base.fontweight-semibold.u-marginbottom-20',
                                        item.question.question
                                    ), item.value()
                                ]))
                        ])
                    ),
                    m('.w-col.w-col-1')
                ])
            )
        );
    }
};

export default surveyPreview;
