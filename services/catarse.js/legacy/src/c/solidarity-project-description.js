import m from 'mithril';
import _ from 'underscore';
import h from '../h';

const I18nScope = _.partial(h.i18nScope, 'projects.solidarity_taxes');

export const SolidarityProjectDescription = {

    view({ attrs }) {
        const percentage = attrs.percentage;
        
        return m('div.card.u-radius.u-marginbottom-30.medium.u-margintop-60', [
            m('img.u-marginbottom-30[src="https://uploads-ssl.webflow.com/57ba58b4846cc19e60acdd5b/5e8b035bacdbb521ac436d8f_5e86f85606a3a305c596fa7c_catarsesolidariablueheart.png"][width="177"][alt=""]'),
            m('div.fontsize-small', [
                m.trust(I18n.t('title', I18nScope())),
                m.trust(I18n.t('p1', I18nScope())),
                m.trust(I18n.t('p2', I18nScope({ percentage }))),
                m.trust(I18n.t('p3', I18nScope())),
            ])
        ]);
    }
}