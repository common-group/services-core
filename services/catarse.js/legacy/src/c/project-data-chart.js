/**
 * window.c.ProjectDataChart component
 * A graph builder interface to be used on project related dashboards.
 * Example:
 * m.component(c.ProjectDataChart, {
 *     collection: ctrl.contributionsPerDay,
 *     label: 'R$ arrecadados por dia',
 *     dataKey: 'total_amount'
 * })
 */
import m from 'mithril';
import _ from 'underscore';
import Chart from 'chart.js';

const projectDataChart = {
    controller: function(args) {
        const resource = _.first(args.collection()),
            limitDataset = args.limitDataset,
            source = !_.isUndefined(resource)
                ? _.isNumber(limitDataset)
                    ? _.last(resource.source, limitDataset)
                    : resource.source
                : [],
            mountDataset = () => [{
                fillColor: 'rgba(126,194,69,0.2)',
                strokeColor: 'rgba(126,194,69,1)',
                pointColor: 'rgba(126,194,69,1)',
                pointStrokeColor: '#fff',
                pointHighlightFill: '#fff',
                pointHighlightStroke: 'rgba(220,220,220,1)',
                data: _.map(source, item => item[args.dataKey])
            }],
            renderChart = (element, isInitialized) => {
                if (!isInitialized) {
                    const ctx = element.getContext('2d');

                    new Chart(ctx).Line({
                        labels: args.xAxis ? _.map(source, item => args.xAxis(item)) : [],
                        datasets: mountDataset()
                    });
                }
            };

        return {
            renderChart,
            source
        };
    },
    view: function(ctrl, args) {
        return m('.card.u-radius.medium.u-marginbottom-30', [
            m('.fontweight-semibold.u-marginbottom-10.fontsize-large.u-text-center', args.label),
            m('.u-text-center.fontsize-smaller.fontcolor-secondary.lineheight-tighter.u-marginbottom-20', args.subLabel || ''),
            m('.w-row', [
                m('.w-col.w-col-12.overflow-auto', [
                    !_.isEmpty(ctrl.source) ? m('canvas[id="chart"][width="860"][height="300"]', {
                        config: ctrl.renderChart
                    }) : m('.w-col.w-col-8.w-col-push-2', m('p.fontsize-base', args.emptyState))
                ]),
            ])
        ]);
    }
};

export default projectDataChart;
