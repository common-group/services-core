window.c.root.Insights = ((m, c, h, models, _, I18n) => {
    const I18nScope = _.partial(h.i18nScope, 'projects.insights');

    return {
        controller: (args) => {
            let filtersVM = m.postgrest.filtersVM({
                    project_id: 'eq'
                }),
                displayModal = h.toggleProp(false, true),
                insightsVM = c.InsightsVM,
                projectDetails = m.prop([]),
                contributionsPerDay = m.prop([]),
                contributionsPerLocation = m.prop([]),
                loader = m.postgrest.loaderWithToken;

            if (h.paramByName('online_success') === 'true') {
              displayModal.toggle();
            }

            filtersVM.project_id(args.root.getAttribute('data-id'));

            const l = loader(models.projectDetail.getRowOptions(filtersVM.parameters()));
            l.load().then(projectDetails);

            const lContributionsPerDay = loader(models.projectContributionsPerDay.getRowOptions(filtersVM.parameters()));
            lContributionsPerDay.load().then(contributionsPerDay);

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

            const lContributionsPerLocation = loader(models.projectContributionsPerLocation.getRowOptions(filtersVM.parameters()));
            lContributionsPerLocation.load().then(buildPerLocationTable);

            let contributionsPerRefTable = [[
                I18n.t('ref_table.header.origin', I18nScope()),
                I18n.t('ref_table.header.contributions', I18nScope()),
                I18n.t('ref_table.header.amount', I18nScope())
            ]];
            const buildPerRefTable = (contributions) => {
                return (!_.isEmpty(contributions)) ? _.map(_.first(contributions).source, (contribution) => {
                    //Test if the string matches a word starting with ctrse_ and followed by any non-digit group of characters
                    //This allows to remove any versioned referral (i.e.: ctrse_newsletter_123) while still getting ctrse_test_ref
                    const re = /(ctrse_[\D]*)/,
                        test = re.exec(contribution.referral_link);

                    let column = [];

                    if (test){
                        //Removes last underscore if it exists
                        contribution.referral_link = test[0].substr(-1) === '_' ? test[0].substr(0, test[0].length - 1) : test[0];
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

            const lContributionsPerRef = loader(models.projectContributionsPerRef.getRowOptions(filtersVM.parameters()));
            lContributionsPerRef.load().then(buildPerRefTable);

            const explanationModeComponent = (projectMode) => {
                const modes = {
                    'aon': c.AonAdminProjectDetailsExplanation,
                    'flex': c.FlexAdminProjectDetailsExplanation
                };

                return modes[projectMode];
            };

            return {
                l: l,
                lContributionsPerRef: lContributionsPerRef,
                lContributionsPerLocation: lContributionsPerLocation,
                lContributionsPerDay: lContributionsPerDay,
                displayModal: displayModal,
                filtersVM: filtersVM,
                projectDetails: projectDetails,
                contributionsPerDay: contributionsPerDay,
                contributionsPerLocationTable: contributionsPerLocationTable,
                contributionsPerRefTable: contributionsPerRefTable,
                explanationModeComponent: explanationModeComponent
            };
        },
        view: (ctrl) => {
            const project = m.prop(_.first(ctrl.projectDetails())),
                  successModalC = [ 'OnlineSucessModalContent' ],
                  tooltip = (el) => {
                      return m.component(c.Tooltip, {
                          el: el,
                          text: [
                              I18n.t('tooltip', I18nScope()),
                              m(`a[href="${I18n.t('ref_table.help_url', I18nScope())}"][target='_blank']`, 'aqui.')
                          ],
                          width: 380
                      });
                  };

            project.user.name = project.user.name || 'Realizador';

            return m('.project-insights', !ctrl.l() ? [
                (project().is_owner_or_admin ? m.component(c.ProjectDashboardMenu, {
                    project: project
                }) : ''),
                (ctrl.displayModal() ? m.component(c.ModalBox, {
                    displayModal: ctrl.displayModal,
                    content: successModalC
                }) : ''),
                m('.w-container', [
                    (project().state == 'successful' ? m.component(c.ProjectSuccessfulOnboard, {project: project})
                     : m('.w-row.u-marginbottom-40', [
                         m('.w-col.w-col-2'),
                         m('.w-col.w-col-8.dashboard-header.u-text-center', [
                             m('.fontweight-semibold.fontsize-larger.lineheight-looser.u-marginbottom-10', I18n.t('campaign_title', I18nScope())),
                             m('p.' + project().state + '-project-text.fontsize-small.lineheight-loose', [
                                 project().mode === 'flex' && _.isNull(project().expires_at) && project().state !== 'draft' ? m('span', [
                                     I18n.t('finish_explanation', I18nScope()),
                                     m('a.alt-link[href="http://suporte.catarse.me/hc/pt-br/articles/206507863-Catarse-flex-Principais-perguntas-e-respostas-"][target="_blank"]', I18n.t('know_more', I18nScope()))
                                 ]) : m.trust(I18n.t(`campaign.${project().mode}.${project().state}`, I18nScope({username: project().user.name, expires_at: h.momentify(project().zone_expires_at), sent_to_analysis_at: h.momentify(project().sent_to_analysis_at)})))
                             ])
                         ]),
                         m('.w-col.w-col-2')
                     ])
                    )
                ]), (project().is_published) ? [
                    m('.divider'),
                    m('.w-section.section-one-column.section.bg-gray.before-footer', [
                        m('.w-container', [
                            m.component(c.ProjectDataStats, {project: project}),
                            m('.w-row', [
                                m('.w-col.w-col-12.u-text-center', {
                                    style: {
                                        'min-height': '300px'
                                    }
                                }, [
                                    !ctrl.lContributionsPerDay() ? m.component(c.ProjectDataChart, {
                                        collection: ctrl.contributionsPerDay,
                                        label: I18n.t('amount_per_day_label', I18nScope()),
                                        dataKey: 'total_amount',
                                        xAxis: (item) => h.momentify(item.paid_at)
                                    }) : h.loader()
                                ]),
                            ]),
                            m('.w-row', [
                                m('.w-col.w-col-12.u-text-center', {
                                    style: {
                                        'min-height': '300px'
                                    }
                                }, [
                                    !ctrl.lContributionsPerDay() ? m.component(c.ProjectDataChart, {
                                        collection: ctrl.contributionsPerDay,
                                        label: I18n.t('contributions_per_day_label', I18nScope()),
                                        dataKey: 'total',
                                        xAxis: (item) => h.momentify(item.paid_at)
                                    }) : h.loader()
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
                                        !ctrl.lContributionsPerRef() ? m.component(c.ProjectDataTable, {
                                            table: ctrl.contributionsPerRefTable,
                                            defaultSortIndex: -2
                                        }) : h.loader()
                                    ])
                                ]),
                            ]),
                            m('.w-row', [
                                m('.w-col.w-col-12.u-text-center', [
                                    m('.project-contributions-per-ref', [
                                        m('.fontweight-semibold.u-marginbottom-10.fontsize-large.u-text-center', I18n.t('location_origin_title', I18nScope())),
                                        !ctrl.lContributionsPerLocation() ? m.component(c.ProjectDataTable, {
                                            table: ctrl.contributionsPerLocationTable,
                                            defaultSortIndex: -2
                                        }) : h.loader()
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
