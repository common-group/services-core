window.c.ProjectContributionsPerLocationTable = (function(m, models, h, _) {
    return {
        controller: function(args) {
            var vm = m.postgrest.filtersVM({
                    project_id: 'eq'
                }),
                contributionsPerLocation = m.prop([]),
                generateSort = function(field) {
                    return function() {
                        var collection = contributionsPerLocation(),
                            resource = collection[0],
                            orderedSource = _.sortBy(resource.source, field);

                        if (resource.orderFilter === undefined) {
                            resource.orderFilter = 'DESC';
                        }

                        if (resource.orderFilter === 'DESC') {
                            orderedSource = orderedSource.reverse();
                        }

                        resource.source = orderedSource;
                        resource.orderFilter = (resource.orderFilter === 'DESC' ? 'ASC' : 'DESC');
                        contributionsPerLocation(collection);
                    };
                };

            vm.project_id(args.resourceId);

            models.projectContributionsPerLocation.getRow(vm.parameters()).then(function(data) {
                contributionsPerLocation(data);
                generateSort('total_contributed')();
            });

            return {
                contributionsPerLocation: contributionsPerLocation,
                generateSort: generateSort
            };
        },
        view: function(ctrl) {
            return m('.project-contributions-per-location', [
                m('.fontweight-semibold.u-marginbottom-10.fontsize-large.u-text-center', 'Localização geográfica dos apoios'),
                ctrl.contributionsPerLocation().map(function(contributionLocation) {
                    return m('.table-outer.u-marginbottom-60', [
                        m('.w-row.table-row.fontweight-semibold.fontsize-smaller.header', [
                            m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.table-col', [
                                m('div', 'Estado')
                            ]),
                            m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.table-col[data-ix="sort-arrows"]', [
                                m('a.link-hidden[href="javascript:void(0);"]', {
                                    onclick: ctrl.generateSort('total_contributions')
                                }, [
                                    'Apoios ', m('span.fa.fa-sort')
                                ])
                            ]),
                            m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.table-col[data-ix="sort-arrows"]', [
                                m('a.link-hidden[href="javascript:void(0);"]', {
                                    onclick: ctrl.generateSort('total_contributed')
                                }, [
                                    'R$ apoiados ',
                                    m('span.w-hidden-small.w-hidden-tiny', '(% do total) '),
                                    ' ', m('span.fa.fa-sort')
                                ])
                            ])
                        ]),
                        m('.table-inner.fontsize-small', [
                            _.map(contributionLocation.source, function(source) {
                                return m('.w-row.table-row', [
                                    m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.table-col', [
                                        m('div', source.state_acronym || 'Outro/other')
                                    ]),
                                    m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.table-col', [
                                        m('div', source.total_contributions)
                                    ]),
                                    m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.table-col', [
                                        m('div', [
                                            'R$ ',
                                            h.formatNumber(source.total_contributed, 2, 3),
                                            m('span.w-hidden-small.w-hidden-tiny', ' (' + source.total_on_percentage.toFixed(2) + '%)')
                                        ])
                                    ])
                                ]);
                            })
                        ])
                    ]);
                })
            ]);
        }
    };
}(window.m, window.c.models, window.c.h, window._));
