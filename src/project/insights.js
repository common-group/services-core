window.c.project.Insights = ((m, c, h, models, _, I18n) => {
    const I18nScope = _.partial(h.i18nScope, 'projects.insights');

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
                return (!_.isEmpty(contributions)) ? _.map(_.first(contributions).source, (contribution) => {
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
                }) : [];
            };
            models.projectContributionsPerLocation.getRow(filtersVM.parameters()).then(buildPerLocationTable);

            let contributionsPerRefTable = [[
                I18n.t('ref_table.header.origin', I18nScope()),
                I18n.t('ref_table.header.contributions', I18nScope()),
                I18n.t('ref_table.header.amount', I18nScope())
            ]];
            const buildPerRefTable = (contributions) => {
                return (!_.isEmpty(contributions)) ? _.map(_.first(contributions).source, (contribution) => {
                    const re = /(ctrse_[a-z]*)/,
                        test = re.exec(contribution.referral_link);

                    let column = [];

                    if (test){
                        contribution.referral_link = test[0];
                    }

                    column.push(contribution.referral_link ? I18n.t('referral.' + contribution.referral_link, I18nScope({defaultValue: contribution.referral_link})) : I18n.t('referral.others', I18nScope()));
                    column.push(contribution.total);
                    column.push([contribution.total_amount,[
                        m(`input[type="hidden"][value="${contribution.total_contributed}"`),
                        'R$ ',
                        h.formatNumber(contribution.total_amount, 2, 3),
                        m('span.w-hidden-small.w-hidden-tiny', ' (' + contribution.total_on_percentage.toFixed(2) + '%)')
                    ]]);
                    return contributionsPerRefTable.push(column);
                }) : [];
            };
            models.projectContributionsPerRef.getRow(filtersVM.parameters()).then(buildPerRefTable);

            const explanationModeComponent = (projectMode) => {
                const modes = {
                    'aon': c.AonAdminProjectDetailsExplanation,
                    'flex': c.FlexAdminProjectDetailsExplanation
                };

                return modes[projectMode];
            };

            return {
                l: l,
                filtersVM: filtersVM,
                projectDetails: projectDetails,
                contributionsPerDay: contributionsPerDay,
                contributionsPerLocationTable: contributionsPerLocationTable,
                contributionsPerRefTable: contributionsPerRefTable,
                explanationModeComponent: explanationModeComponent
            };
        },
        view: (ctrl) => {
            const project = _.first(ctrl.projectDetails()),
                tooltip = (el) => {
                    return m.component(c.Tooltip, {
                        el: el,
                        text: [
                            'Informa de onde vieram os apoios de seu projeto. Saiba como usar essa tabela e planejar melhor suas ações de comunicação ',
                            m(`a[href="${I18n.t('ref_table.help_url', I18nScope())}"][target='_blank']`, 'aqui.')
                        ],
                        width: 380
                    });
                };

            return m('.project-insights', !ctrl.l() ? [
                (project.is_owner_or_admin ? m.component(c.ProjectDashboardMenu, {
                    project: project
                }) : ''),
                m('.w-container', [
                    m('.w-row.u-marginbottom-40', [
                        m('.w-col.w-col-2'),
                        m('.w-col.w-col-8.dashboard-header.u-text-center', [
                            m('.fontweight-semibold.fontsize-larger.lineheight-looser.u-marginbottom-10', I18n.t('campaign_title', I18nScope())),
                            m.component(c.AdminProjectDetailsCard, {
                                resource: project
                            }),
                            m.component(ctrl.explanationModeComponent(project.mode), {
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
                                        label: I18n.t('amount_per_day_label', I18nScope()),
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
                                        label: I18n.t('contributions_per_day_label', I18nScope()),
                                        dataKey: 'total',
                                        xAxis: (item) => h.momentify(item.paid_at)
                                    })
                                ]),
                            ]),
                            m('.w-row', [
                                m('.w-col.w-col-12.u-text-center', [
                                    m('.project-contributions-per-ref', [
                                        m('.fontweight-semibold.u-marginbottom-10.fontsize-large.u-text-center', [
                                            I18n.t('ref_origin_title', I18nScope()),
                                            h.newFeatureBadge(),
                                            tooltip('span.fontsize-smallest.tooltip-wrapper.fa.fa-question-circle.fontcolor-secondary')
                                        ]),
                                        m.component(c.ProjectDataTable, {
                                            table: ctrl.contributionsPerRefTable,
                                            defaultSortIndex: -2
                                        })
                                    ])
                                ]),
                            ]),
                            m('.w-row', [
                                m('.w-col.w-col-12.u-text-center', [
                                    m('.project-contributions-per-ref', [
                                        m('.fontweight-semibold.u-marginbottom-10.fontsize-large.u-text-center', I18n.t('location_origin_title', I18nScope())),
                                        m.component(c.ProjectDataTable, {
                                            table: ctrl.contributionsPerLocationTable
                                        })
                                    ])
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
}(window.m, window.c, window.c.h, window.c.models, window._, window.I18n));
