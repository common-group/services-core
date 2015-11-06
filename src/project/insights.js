window.c.project.Insights = ((m, c, h, models, _) => {
    return {
        controller: (args) => {
            let filtersVM = m.postgrest.filtersVM({
                    project_id: 'eq'
                }),
                insightsVM = c.InsightsVM,
                projectDetails = m.prop([]),
                contributionsPerDay = m.prop([]),
                contributionsPerLocation = m.prop([]),
                l = m.prop(false);

            filtersVM.project_id(args.root.getAttribute('data-id'));

            l = m.postgrest.loaderWithToken(models.projectDetail.getRowOptions(filtersVM.parameters()));
            l.load().then(projectDetails);

            models.projectContributionsPerDay.getRow(filtersVM.parameters()).then(contributionsPerDay);

            let contributionsPerLocationTable = [['Estado', 'Apoios', 'R$ apoiados (% do total)']];
            const buildPerLocationTable = (contributions) => {
                return _.map(_.first(contributions).source, (contribution) => {
                    let column = [];

                    column.push(contribution.state_acronym || 'Outro/other');
                    column.push(contribution.total_contributions);
                    column.push([contribution.total_contributed,[//Adding row with custom comparator => read project-data-table description
                        m(`input[type="hidden"][value="${contribution.total_contributed}"`),
                        'R$ ',
                        h.formatNumber(contribution.total_contributed, 2, 3),
                        m('span.w-hidden-small.w-hidden-tiny', ' (' + contribution.total_on_percentage.toFixed(2) + '%)')
                    ]]);
                    return contributionsPerLocationTable.push(column);
                });
            };
            models.projectContributionsPerLocation.getRow(filtersVM.parameters()).then(buildPerLocationTable);

            let contributionsPerRefTable = [['Fonte', 'Apoios', 'R$ apoiados (% do total)']];
            const buildPerRefTable = (contributions) => {
                return _.map(_.first(contributions).source, (contribution) => {
                    let column = [];

                    column.push(contribution.referral_link || 'direto');
                    column.push(contribution.total);
                    column.push([contribution.total_amount,[//Adding row with custom comparator => read project-data-table description
                        m(`input[type="hidden"][value="${contribution.total_contributed}"`),
                        'R$ ',
                        h.formatNumber(contribution.total_amount, 2, 3),
                        m('span.w-hidden-small.w-hidden-tiny', ' (' + contribution.total_on_percentage.toFixed(2) + '%)')
                    ]]);
                    return contributionsPerRefTable.push(column);
                });
            };
            models.projectContributionsPerRef.getRow(filtersVM.parameters()).then(buildPerRefTable);

            return {
                l: l,
                filtersVM: filtersVM,
                projectDetails: projectDetails,
                contributionsPerDay: contributionsPerDay,
                contributionsPerLocationTable: contributionsPerLocationTable,
                contributionsPerRefTable: contributionsPerRefTable
            };
        },
        view: (ctrl) => {
            const project = _.first(ctrl.projectDetails());

            return m('.project-insights', !ctrl.l() ? [
                (project.is_owner_or_admin ? m.component(c.ProjectDashboardMenu, {
                    project: project
                }) : ''),
                m('.w-container', [
                    m('.w-row.u-marginbottom-40', [
                        m('.w-col.w-col-2'),
                        m('.w-col.w-col-8.dashboard-header.u-text-center', [
                            m('.fontweight-semibold.fontsize-larger.lineheight-looser.u-marginbottom-10', 'Minha campanha'),
                            m.component(c.AdminProjectDetailsCard, {
                                resource: project
                            }),
                            m.component(c.AdminProjectDetailsExplanation, {
                                resource: project
                            })
                        ]),
                        m('.w-col.w-col-2')
                    ])
                ]), (project.is_published) ? [
                    m('.divider'),
                    m('.w-section.section-one-column.section.bg-gray.before-footer', [
                        m('.w-container', [
                            m('.w-row', [
                                m('.w-col.w-col-12.u-text-center', {
                                    style: {
                                        'min-height': '300px'
                                    }
                                }, [
                                    m.component(c.ProjectDataChart, {
                                        collection: ctrl.contributionsPerDay,
                                        label: 'R$ arrecadados por dia',
                                        dataKey: 'total_amount',
                                        xAxis: (item) => h.momentify(item.paid_at)
                                    })
                                ]),
                            ]),
                            m('.w-row', [
                                m('.w-col.w-col-12.u-text-center', {
                                    style: {
                                        'min-height': '300px'
                                    }
                                }, [
                                    m.component(c.ProjectDataChart, {
                                        collection: ctrl.contributionsPerDay,
                                        label: 'Apoios confirmados por dia',
                                        dataKey: 'total',
                                        xAxis: (item) => h.momentify(item.paid_at)
                                    })
                                ]),
                            ]),
                            m('.w-row', [
                                m('.w-col.w-col-12.u-text-center', [
                                    m.component(c.ProjectDataTable, {
                                        label: 'Localização geográfica dos apoios',
                                        table: ctrl.contributionsPerLocationTable
                                    })
                                ]),
                            ]),
                            m('.w-row', [
                                m('.w-col.w-col-12.u-text-center', [
                                    m.component(c.ProjectDataTable, {
                                        label: 'Origem dos apoios',
                                        table: ctrl.contributionsPerRefTable
                                    })
                                ]),
                            ]),
                            m('.w-row', [
                                m('.w-col.w-col-12.u-text-center', [
                                    m.component(c.ProjectReminderCount, {
                                        resource: project
                                    })
                                ]),
                            ])
                        ])
                    ])
                ] : ''
            ] : h.loader());
        }
    };
}(window.m, window.c, window.c.h, window.c.models, window._));
