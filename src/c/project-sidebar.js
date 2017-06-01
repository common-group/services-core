import m from 'mithril';
import _ from 'underscore';
import I18n from 'i18n-js';
import h from '../h';
import projectMode from './project-mode';
import projectReminder from './project-reminder';
import projectUserCard from './project-user-card';
import projectShareBox from './project-share-box';
import projectFriends from './project-friends';
import addressTag from './address-tag';
import categoryTag from './category-tag';

const I18nScope = _.partial(h.i18nScope, 'projects.project_sidebar');

const projectSidebar = {
    controller(args) {
        const project = args.project,
            animateProgress = (el, isInitialized) => {
                if (!isInitialized) {
                    let animation,
                        progress = 0,
                        pledged = 0,
                        contributors = 0;
                    const pledgedIncrement = project().pledged / project().progress,
                        contributorsIncrement = project().total_contributors / project().progress;

                    const progressBar = document.getElementById('progressBar'),
                        pledgedEl = document.getElementById('pledged'),
                        contributorsEl = document.getElementById('contributors'),
                        incrementProgress = () => {
                            if (progress <= parseInt(project().progress)) {
                                progressBar.style.width = `${progress}%`;
                                pledgedEl.innerText = `R$ ${h.formatNumber(pledged)}`;
                                contributorsEl.innerText = `${parseInt(contributors)} pessoas`;
                                el.innerText = `${progress}%`;
                                pledged += pledgedIncrement;
                                contributors += contributorsIncrement;
                                progress += 1;
                            } else {
                                clearInterval(animation);
                            }
                        },
                        animate = () => {
                            animation = setInterval(incrementProgress, 28);
                        };

                    setTimeout(() => {
                        animate();
                    }, 1800);
                }
            };

        return {
            animateProgress,
            displayShareBox: h.toggleProp(false, true)
        };
    },
    view(ctrl, args) {
        const project = args.project,
            elapsed = project().elapsed_time,
            remaining = project().remaining_time,
            displayCardClass = () => {
                const states = {
                    waiting_funds: 'card-waiting',
                    successful: 'card-success',
                    failed: 'card-error',
                    draft: 'card-dark',
                    in_analysis: 'card-dark',
                    approved: 'card-dark'
                };

                return (states[project().state] ? `card u-radius zindex-10 ${states[project().state]}` : '');
            },
            displayStatusText = () => {
                const states = {
                    approved: I18n.t('display_status.approved', I18nScope()),
                    online: h.existy(project().zone_expires_at) && project().open_for_contributions ? I18n.t('display_status.online', I18nScope({ date: h.momentify(project().zone_expires_at) })) : '',
                    failed: I18n.t('display_status.failed', I18nScope({ date: h.momentify(project().zone_expires_at), goal: `R$ ${h.formatNumber(project().goal, 2, 3)}` })),
                    rejected: I18n.t('display_status.rejected', I18nScope()),
                    in_analysis: I18n.t('display_status.in_analysis', I18nScope()),
                    successful: I18n.t('display_status.successful', I18nScope({ date: h.momentify(project().zone_expires_at) })),
                    waiting_funds: I18n.t('display_status.waiting_funds', I18nScope()),
                    draft: I18n.t('display_status.draft', I18nScope())
                };

                return states[project().state];
            };

        return m('#project-sidebar.aside', [
            m('.project-stats', [
                m('.project-stats-inner', [
                    m('.project-stats-info', [
                        m('.u-marginbottom-20', [
                            m('#pledged.fontsize-largest.fontweight-semibold.u-text-center-small-only', `R$ ${project().pledged ? h.formatNumber(project().pledged) : '0'}`),
                            m('.fontsize-small.u-text-center-small-only', [
                                I18n.t('contributors_call', I18nScope()),
                                m('span#contributors.fontweight-semibold', I18n.t('contributors_count', I18nScope({ count: project().total_contributors }))),
                                (!project().expires_at && elapsed) ? ` em ${I18n.t(`datetime.distance_in_words.x_${elapsed.unit}`, { count: elapsed.total }, I18nScope())}` : ''
                            ])
                        ]),
                        m('.meter', [
                            m('#progressBar.meter-fill', {
                                style: {
                                    width: `${project().progress}%`
                                }
                            })
                        ]),
                        m('.w-row.u-margintop-10', [
                            m('.w-col.w-col-5.w-col-small-6.w-col-tiny-6', [
                                m('.fontsize-small.fontweight-semibold.lineheight-tighter', `${project().progress ? parseInt(project().progress) : '0'}%`)
                            ]),
                            m('.w-col.w-col-7.w-col-small-6.w-col-tiny-6.w-clearfix', [
                                m('.u-right.fontsize-small.lineheight-tighter', remaining && remaining.total ? [
                                    m('span.fontweight-semibold', remaining.total), I18n.t(`remaining_time.${remaining.unit}`, I18nScope({ count: remaining.total }))
                                ] : '')
                            ])
                        ])
                    ]),
                    m('.w-row', [
                        m.component(projectMode, {
                            project
                        })
                    ])
                ]),
                (project().open_for_contributions ? m('.back-project-btn-div', [
                    m('.back-project--btn-row', [
                        m('a#contribute_project_form.btn.btn-large.u-marginbottom-20[href="javascript:void(0);"]', {
                            onclick: h.analytics.event({
                                cat: 'contribution_create',
                                act: 'contribution_button_click',
                                project: project()
                            }, () => h.navigateTo(`/projects/${project().project_id}/contributions/new`))

                        }, I18n.t('submit', I18nScope()))
                    ]),
                    m('.back-project-btn-row-right', m.component(projectReminder, {
                        project,
                        type: 'link'
                    }))
                ]) : ''),
                m('.friend-backed-card.project-page', [
                    (!_.isUndefined(project()) && project().contributed_by_friends ? m.component(projectFriends, { project: project(), wrapper: 'div' }) : '')
                ]),
                m(`div[class="fontsize-smaller u-marginbottom-30 ${displayCardClass()}"]`, displayStatusText())
            ]),
            m('.project-share.w-hidden-main.w-hidden-medium', [
                m.component(addressTag, { project }),
                m.component(categoryTag, { project }),
                m('.u-marginbottom-30.u-text-center-small-only', m('button.btn.btn-inline.btn-medium.btn-terciary', {
                    onclick: ctrl.displayShareBox.toggle
                }, 'Compartilhar este projeto')),
                ctrl.displayShareBox() ? m(projectShareBox, {
                    project,
                    displayShareBox: ctrl.displayShareBox
                }) : ''
            ]),
            m('.user-c', m.component(projectUserCard, {
                userDetails: args.userDetails,
                project
            }))
        ]);
    }
};

export default projectSidebar;
