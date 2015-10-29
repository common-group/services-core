window.c.project.Insights = (function(m, c, models, _) {
    return {
        controller: function(args) {
            var vm = m.postgrest.filtersVM({
                    project_id: 'eq'
                }),
                projectDetails = m.prop([]),
                contributionsPerDay = m.prop([]);

            vm.project_id(args.root.getAttribute('data-id'));

            models.projectDetail.getRowWithToken(vm.parameters()).then(projectDetails);
            models.projectContributionsPerDay.getRow(vm.parameters()).then(contributionsPerDay);

            return {
                vm: vm,
                projectDetails: projectDetails,
                contributionsPerDay: contributionsPerDay
            };
        },
        view: function(ctrl) {
            return _.map(ctrl.projectDetails(), function(project) {
                return m('.project-insights', [
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
                    ]), (function(project) {
                        if (project.is_published) {
                            return [
                                m('.divider'),
                                m('.w-section.section-one-column.section.bg-gray.before-footer', [
                                    m('.w-container', [
                                        m('.w-row', [
                                            m('.w-col.w-col-12.u-text-center', {
                                                style: {
                                                    'min-height': '300px'
                                                }
                                            }, [
                                                m.component(c.ProjectChartContributionTotalPerDay, {
                                                    collection: ctrl.contributionsPerDay
                                                })
                                            ]),
                                        ]),
                                        m('.w-row', [
                                            m('.w-col.w-col-12.u-text-center', {
                                                style: {
                                                    'min-height': '300px'
                                                }
                                            }, [
                                                m.component(c.ProjectChartContributionAmountPerDay, {
                                                    collection: ctrl.contributionsPerDay
                                                })
                                            ]),
                                        ]),
                                        m('.w-row', [
                                            m('.w-col.w-col-12.u-text-center', [
                                                m.component(c.ProjectContributionsPerLocationTable, {
                                                    resourceId: ctrl.vm.project_id()
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
                            ];
                        }
                    }(project))
                ]);
            });
        }
    };
}(window.m, window.c, window.c.models, window._));
