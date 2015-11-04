window.c.ProjectDataChart = ((m, Chart, _, h) => {
    return {
        controller: (args) => {
            const resource = _.first(args.collection()),
                mountDataset = () => {
                    return [{
                        fillColor: 'rgba(126,194,69,0.2)',
                        strokeColor: 'rgba(126,194,69,1)',
                        pointColor: 'rgba(126,194,69,1)',
                        pointStrokeColor: '#fff',
                        pointHighlightFill: '#fff',
                        pointHighlightStroke: 'rgba(220,220,220,1)',
                        data: _.map(resource.source, (item) => {
                            return item[args.dataKey];
                        })
                    }];
                },
                renderChart = (element, isInitialized) => {
                    if (!isInitialized) {
                        const ctx = element.getContext('2d');

                        new Chart(ctx).Line({
                            labels: _.map(resource.source, (item) => {
                                return h.momentify(item.paid_at);
                            }),
                            datasets: mountDataset()
                        });
                    }

                };

            return {
                renderChart: renderChart
            };
        },
        view: (ctrl, args) => {
            return m('.card.u-radius.medium.u-marginbottom-30', [
                m('.fontweight-semibold.u-marginbottom-10.fontsize-large.u-text-center', args.label),
                m('.w-row', [
                    m('.w-col.w-col-12.overflow-auto', [
                        m('canvas[id="chart"][width="860"][height="300"]', {
                            config: ctrl.renderChart
                        })
                    ]),
                ])
            ]);
        }
    };
}(window.m, window.Chart, window._, window.c.h));
