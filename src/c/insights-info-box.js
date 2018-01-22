import m from 'mithril';
import _ from 'underscore';
import I18n from 'i18n-js';
import h from '../h';

const I18nScope = _.partial(h.i18nScope, 'projects.insights');

const insightsInfoBox = {
    view(ctrl, args) {
        const newCount = args.newCount,
              oldCount = args.oldCount,
              countIncrease = oldCount > 0 ? Math.floor(((newCount - oldCount) / oldCount) * 100) : null;

        return m('.flex-column.card.u-radius.u-marginbottom-10', [
            m('div',
                args.label
            ),
            m('.fontsize-smallest.fontcolor-secondary.lineheight-tighter',
                'Últimos 7 dias'
            ),
            m('.fontsize-largest.fontweight-semibold',
              args.info
             ),
            oldCount > 0 ?
            m(`.fontsize-small.fontweight-semibold.lineheight-tighter.text-${newCount >= oldCount ? 'success' : 'error'}`, [
                m(`span.fa.fa-arrow-${newCount >= oldCount ? 'up' : 'down'}`,
                    ' '
                ),
                `${countIncrease}%`
            ]) : '--',
            m('.fontsize-mini.fontweight-semibold.fontcolor-secondary.lineheight-tighter',
                'Semana anterior'
            )
        ]);
    }
};

export default insightsInfoBox;
