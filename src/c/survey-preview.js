import m from 'mithril';
import _ from 'underscore';
import I18n from 'i18n-js';
import h from '../h';

const I18nScope = _.partial(h.i18nScope, 'activerecord.attributes.address');

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
                            (args.confirmAddress ?
                            m('.u-marginbottom-30', [
                                m('.fontcolor-secondary.fontsize-base.fontweight-semibold.u-marginbottom-20',
                                    I18n.t('delivery_address', I18nScope())
                                ),
                                m('.fontsize-base', [
                                    m('span.fontweight-semibold',
                                        `${I18n.t('country', I18nScope())}: `
                                    ),
                                    args.countryName,
                                    m('br'),
                                    m('span.fontweight-semibold',
                                        `${I18n.t('address_street', I18nScope())}:`
                                    ),
                                    m.trust('&nbsp;'),
                                    ctrl.fields.address_street,
                                    m('br'),
                                    m('span.fontweight-semibold',
                                        `${I18n.t('address_number', I18nScope())}:`
                                    ),
                                    m.trust('&nbsp;'),
                                    ctrl.fields.address_number,
                                    m('br'),
                                    m('span.fontweight-semibold',
                                        `${I18n.t('address_complement', I18nScope())}:`
                                    ),
                                    m.trust('&nbsp;'),
                                    ctrl.fields.address_complement,
                                    m('br'),
                                    m('span.fontweight-semibold',
                                        `${I18n.t('address_neighbourhood', I18nScope())}:`
                                    ),
                                    m.trust('&nbsp;'),
                                    ctrl.fields.address_neighbourhood,
                                    m('br'),
                                    m('span.fontweight-semibold',
                                        `${I18n.t('address_city', I18nScope())}:`
                                    ),
                                    m.trust('&nbsp;'),
                                    ctrl.fields.address_city,
                                    m('br'),
                                    m('span.fontweight-semibold',
                                        `${I18n.t('address_state', I18nScope())}:`
                                    ),
                                    m.trust('&nbsp;'),
                                    args.stateName,
                                    m('br'),
                                    m('span.fontweight-semibold',
                                        `${I18n.t('address_zip_code', I18nScope())}:`
                                    ),
                                    m.trust('&nbsp;'),
                                    ctrl.fields.address_zip_code,
                                    m('br'),
                                    m('span.fontweight-semibold',
                                        `${I18n.t('phone_number', I18nScope())}:`
                                    ),
                                    m.trust('&nbsp;'),
                                    ctrl.fields.phone_number
                                ])
                            ]) : ''),
                            _.map(ctrl.multipleChoiceQuestions, (item) => {
                                const answer = _.find(item.question.question_choices, choice => item.value() == choice.id);
                                return m('.u-marginbottom-30', [
                                    m('.fontcolor-secondary.fontsize-base.fontweight-semibold',
                                        item.question.question
                                    ),
                                    m('.fontcolor-secondary.fontsize-smaller.u-marginbottom-20',
                                                        item.question.description
                                                    ),
                                    m('.fontsize-base', answer ? answer.option : '')
                                ]);
                            }),
                            _.map(ctrl.openQuestions, item =>
                                m('.u-marginbottom-30', [
                                    m('.fontcolor-secondary.fontsize-base.fontweight-semibold',
                                        item.question.question
                                    ),
                                    m('.fontcolor-secondary.fontsize-smaller.u-marginbottom-20',
                                                        item.question.description
                                                    ),
                                    m('.fontsize-base', item.value())
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
