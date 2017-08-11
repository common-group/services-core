import m from 'mithril';
import _ from 'underscore';
import I18n from 'i18n-js';
import h from '../h';
import userContributedBox from '../c/user-contributed-box';
import loadMoreBtn from './load-more-btn';

const I18nScope = _.partial(h.i18nScope, 'users.show.contributions');

const userContributedList = {
    controller(args) {
        const title = args.title,
            hideSurveys = args.hideSurveys;
        return {
            hideSurveys,
            title
        };
    },
    view(ctrl, args) {
        const collection = args.collection,
            pagination = args.pagination,
            hideSurveys = ctrl.hideSurveys,
            title = ctrl.title;

        return (!_.isEmpty(collection) ? m('div', [m('.section-one-column.u-marginbottom-30',
                m('.w-container', [
                    m('.fontsize-larger.fontweight-semibold.u-marginbottom-30.u-text-center',
                        title
                    ),
                    m('.card.card-secondary.w-hidden-small.w-hidden-tiny.w-row', [
                        m('.w-col.w-col-3',
                            m('.fontsize-small.fontweight-semibold',
                                I18n.t('project_col', I18nScope())
                            )
                        ),
                        m('.w-col.w-col-3',
                            m('.fontsize-small.fontweight-semibold',
                                I18n.t('contribution_col', I18nScope())
                            )
                        ),
                        m('.w-col.w-col-3',
                            m('.fontsize-small.fontweight-semibold',
                                I18n.t('reward_col', I18nScope())
                            )
                        ),
                        m('.w-col.w-col-1'),
                        (!hideSurveys ?
                            m('.w-col.w-col-2',
                                m('.fontsize-small.fontweight-semibold',
                                    I18n.t('survey_col', I18nScope())
                                )
                            ) : '')
                    ]),
                    _.map(collection, contribution => m(userContributedBox, {
                        contribution
                    })),
                    m('.w-row.u-marginbottom-40.u-margintop-30', [
                        m(loadMoreBtn, {
                            collection: pagination,
                            cssClass: '.w-col-push-4'
                        })
                    ])
                ])),
            m('.divider.u-marginbottom-80.u-margintop-80')
        ]) : m('div', ''));
    }
};

export default userContributedList;
