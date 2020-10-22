/**
 * window.c.ProjectDataChart component
 * A graph builder interface to be used on project related dashboards.
 * Example:
 * m.component(c.ProjectDataChart, {
 *     collection: state.contributionsPerDay,
 *     label: 'R$ arrecadados por dia',
 *     dataKey: 'total_amount'
 * })
 */
import m from 'mithril';
import _ from 'underscore';
import Chart from 'chart.js';

const projectDataChart = {
    oninit: function(vnode) {
        const source = getSource(),
            mountDataset = () => [{
                fillColor: 'rgba(126,194,69,0.2)',
                strokeColor: 'rgba(126,194,69,1)',
                pointColor: 'rgba(126,194,69,1)',
                pointStrokeColor: '#fff',
                pointHighlightFill: '#fff',
                pointHighlightStroke: 'rgba(220,220,220,1)',
                data: _.map(getSource(), item => item[vnode.attrs.dataKey])
            }],
            renderChart = (vnodeCanvas) => {
                const ctx = vnodeCanvas.dom.getContext('2d');

                new Chart(ctx).Line({
                    labels: vnode.attrs.xAxis ? _.map(getSource(), item => vnode.attrs.xAxis(item)) : [],
                    datasets: mountDataset()
                });
            };

        function getSource() {
            const resource = _.first(vnode.attrs.collection());
            const limitDataset = vnode.attrs.limitDataset;
            const source = !_.isUndefined(resource)
                ? _.isNumber(limitDataset)
                    ? _.last(resource.source, limitDataset)
                    : resource.source
                : [];
            return source;
        }

        vnode.state = {
            renderChart,
            getSource,
            lastSource: getSource()
        };
    },
    view: function({state, attrs}) {
        const source = state.getSource();
        return m('.card.u-radius.medium.u-marginbottom-30', [
            m('.fontweight-semibold.u-marginbottom-10.fontsize-large.u-text-center', attrs.label),
            m('.u-text-center.fontsize-smaller.fontcolor-secondary.lineheight-tighter.u-marginbottom-20', attrs.subLabel || ''),
            m('.w-row', [
                m('.w-col.w-col-12.overflow-auto', [
                    !_.isEmpty(source) ? m('canvas[id="chart"][width="860"][height="300"]', {
                        onupdate(vnode) {
                            if (!_.isEqual(state.lastSource, source)) {
                                state.lastSource = source;
                                state.renderChart(vnode);
                            }
                        }
                    }) : m('.w-col.w-col-8.w-col-push-2', m('p.fontsize-base', attrs.emptyState))
                ]),
            ])
        ]);
    }
};

export default projectDataChart;
