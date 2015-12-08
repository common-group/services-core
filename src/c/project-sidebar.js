window.c.ProjectSidebar = ((m, h, c, _, I18n) => {
    const I18nScope = _.partial(h.i18nScope, 'projects.project_sidebar');

    return {
        controller: (args) => {
            const project = args.project,
                animateProgress = (el, isInitialized) => {
                    if (!isInitialized) {
                        let animation, progress = 0,
                            pledged = 0,
                            contributors = 0,
                            pledgedIncrement = project.pledged / project.progress,
                            contributorsIncrement = project.total_contributors / project.progress;

                        const progressBar = document.getElementById('progressBar'),
                            pledgedEl = document.getElementById('pledged'),
                            contributorsEl = document.getElementById('contributors'),
                            animate = () => {
                                animation = setInterval(incrementProgress, 28);
                            },
                            incrementProgress = () => {
                                if (progress <= parseInt(project.progress)) {
                                    progressBar.style.width = `${progress}%`;
                                    pledgedEl.innerText = `R$ ${h.formatNumber(pledged)}`;
                                    contributorsEl.innerText = `${parseInt(contributors)} pessoas`;
                                    el.innerText = `${progress}%`;
                                    pledged = pledged + pledgedIncrement;
                                    contributors = contributors + contributorsIncrement;
                                    progress = progress + 1;
                                } else {
                                    clearInterval(animation);
                                }
                            };

                        setTimeout(() => {
                            animate();
                        }, 1800);
                    }
                },
                displayCardClass = () => {
                    const states = {
                        'waiting_funds': 'card-waiting',
                        'successful': 'card-success',
                        'failed': 'card-error',
                        'draft': 'card-dark',
                        'in_analysis': 'card-dark',
                        'approved': 'card-dark'
                    };

                    return (states[project.state] ? 'card u-radius zindex-10 ' + states[project.state] : '');
                },
                displayStatusText = () => {
                    const states = {
                        'approved': I18n.t('display_status.approved', I18nScope()),
                        'online': h.existy(project.zone_expires_at) ? I18n.t('display_status.online', I18nScope({date: h.momentify(project.zone_expires_at)})) : '',
                        'failed': I18n.t('display_status.failed', I18nScope({date: h.momentify(project.zone_expires_at), goal: project.goal})),
                        'rejected': I18n.t('display_status.rejected', I18nScope()),
                        'in_analysis': I18n.t('display_status.in_analysis', I18nScope()),
                        'successful': I18n.t('display_status.successful', I18nScope({date: h.momentify(project.zone_expires_at)})),
                        'waiting_funds': I18n.t('display_status.waiting_funds', I18nScope()),
                        'draft': I18n.t('display_status.draft', I18nScope())
                    };

                    return states[project.state];
                };

            return {
                animateProgress: animateProgress,
                displayCardClass: displayCardClass,
                displayStatusText: displayStatusText
            };
        },

        view: function(ctrl, args) {
            var project = args.project,
                elapsed = project.elapsed_time,
                remaining = project.remaining_time;

            return m('#project-sidebar.aside', [
                m('.project-stats', [
                    m('.project-stats-inner', [
                        m('.project-stats-info', [
                            m('.u-marginbottom-20', [
                                m('#pledged.fontsize-largest.fontweight-semibold.u-text-center-small-only', `R$ ${h.formatNumber(project.pledged)}`),
                                m('.fontsize-small.u-text-center-small-only', [
                                    I18n.t('contributors_call', I18nScope()),
                                    m('span#contributors.fontweight-semibold', I18n.t('contributors_count', I18nScope({count: project.total_contributors}))),
                                    remaining.total ? ' em ' + I18n.t('datetime.distance_in_words.x_' + elapsed.unit, {count: elapsed.total}, I18nScope()) : ''
                                ])
                            ]),
                            m('.meter', [
                                m('#progressBar.meter-fill', {
                                    style: {
                                        width: `${project.progress}%`
                                    }
                                })
                            ]),
                            m('.w-row.u-margintop-10', [
                                m('.w-col.w-col-5.w-col-small-6.w-col-tiny-6', [
                                    m('.fontsize-small.fontweight-semibold.lineheight-tighter', `${parseInt(project.progress)}%`)
                                ]),
                                m('.w-col.w-col-7.w-col-small-6.w-col-tiny-6.w-clearfix', [
                                    m('.u-right.fontsize-small.lineheight-tighter', remaining.total ? [
                                        m('span.fontweight-semibold', remaining.total), I18n.t('remaining_time.' + remaining.unit, I18nScope({count: remaining.total}))
                                    ] : '')
                                ])
                            ])
                        ]),
                        m('.w-row', [
                            m.component(c.ProjectMode, {
                                project: project
                            })
                        ])
                    ])
                    , (project.open_for_contributions ? m('a#contribute_project_form.btn.btn-large.u-marginbottom-20[href="/projects/' + project.id + '/contributions/new"]', I18n.t('submit', I18nScope())) : ''), ((project.open_for_contributions) ? m.component(c.ProjectReminder, {
                        project: project,
                        type: 'link'
                    }) : ''),
                    m('div[class="fontsize-smaller u-marginbottom-30 ' + (ctrl.displayCardClass()) + '"]', ctrl.displayStatusText())
                ]),
                m('.user-c', m.component(c.ProjectUserCard, {
                    userDetails: args.userDetails
                }))
            ]);
        }
    };
}(window.m, window.c.h, window.c, window._, window.I18n));
