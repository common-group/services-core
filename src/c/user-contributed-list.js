import m from 'mithril';
import _ from 'underscore';
import I18n from 'i18n-js';
import h from '../h';
import userContributedBox from '../c/user-contributed-box';
import loadMoreBtn from './load-more-btn';

const I18nScope = _.partial(h.i18nScope, 'payment.state');

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

        return (!_.isEmpty(collection) ? m('.section-one-column.u-marginbottom-30',
            m('.w-container', [
                m('.fontsize-larger.fontweight-semibold.u-marginbottom-30.u-text-center',
                    title
                ),
                m('.card.card-secondary.w-hidden-small.w-hidden-tiny.w-row', [
                    m('.w-col.w-col-3',
                        m('.fontsize-small.fontweight-semibold',
                            'Projeto'
                        )
                    ),
                    m('.w-col.w-col-3',
                        m('.fontsize-small.fontweight-semibold',
                            'Apoio'
                        )
                    ),
                    m('.w-col.w-col-3',
                        m('.fontsize-small.fontweight-semibold',
                            'Recompensa'
                        )
                    ),
                    m('.w-col.w-col-1'),
                    (!hideSurveys ?
                    m('.w-col.w-col-2',
                        m('.fontsize-small.fontweight-semibold',
                            'Questionário'
                        )
                    ) : '')
                ]),
                _.map(collection, contribution => m(userContributedBox, { contribution })),
                m('.w-row.u-marginbottom-40.u-margintop-30', [
                    m(loadMoreBtn, {
                        collection: pagination,
                        cssClass: '.w-col-push-5'
                    })
                ])
            ])) : m('div', ''));
    }
};

export default userContributedList;
