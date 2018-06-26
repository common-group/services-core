import m from 'mithril';
import _ from 'underscore';
import h from '../h';
import projectReminder from './project-reminder';
import projectVM from '../vms/project-vm';

const I18nScope = _.partial(h.i18nScope, 'projects.project_sidebar');
const projectTabs = {
    controller(args) {
        const fixedNavClass = 'project-nav-fixed',
            isFixed = m.prop(false),
            originalPosition = m.prop(-1),
            project = args.project;

        const fixOnScroll = el => () => {
            const viewportOffset = el.getBoundingClientRect();
            

            if (window.scrollY <= originalPosition() && isFixed()) {
                originalPosition(-1);
                isFixed(false);
                el.classList.remove(fixedNavClass);
            }

            if (viewportOffset.top < 0 || (window.scrollY > originalPosition() && originalPosition() > 0)) {
                if (!isFixed()) {
                    originalPosition(window.scrollY);
                    isFixed(true);
                    el.classList.add(fixedNavClass);
                }
            }

        };

        const navDisplay = (el, isInitialized) => {
            if (!isInitialized) {
                const fixNavBar = fixOnScroll(el);
                window.addEventListener('scroll', fixNavBar);
            }
        };

        const navigate = (event) => {
            event.preventDefault();

            if (projectVM.isSubscription(project)) {
                m.route(`/projects/${project().project_id}/subscriptions/start`);
                return false;
            }

            h.navigateTo(`/projects/${project().project_id}/contributions/new`);

            return false;
        };

        return {
            navDisplay,
            isFixed,
            navigate
        };
    },
    view(ctrl, args) {
        const project = args.project,
            rewards = args.rewardDetails;

        return m('nav-wrapper', project() ? [
            m('.w-section.project-nav', {
                config: ctrl.navDisplay
            }, [
                m('.w-container', [
                    m('.w-row', [
                        m('.w-col.w-col-8', [!_.isEmpty(rewards()) ?
                            m(`a[id="rewards-link"][class="w-hidden-main w-hidden-medium dashboard-nav-link mf  ${(h.hashMatch('#rewards') || (h.mobileScreen() && h.hashMatch('')) ? 'selected' : '')}"][href="/${project().permalink}#rewards"]`, {
                                style: 'float: left;',
                                onclick: h.analytics.event({
                                    cat: 'project_view', act: 'project_rewards_view', project: project() })
                            }, 'Recompensas') : m(`a[id="rewards-link"][class="w-hidden-main w-hidden-medium dashboard-nav-link mf ${(h.hashMatch('#contribution_suggestions') || (h.mobileScreen() && h.hashMatch('')) ? 'selected' : '')}"][href="/${project().permalink}#contribution_suggestions"]`, {
                                style: 'float: left;',
                                onclick: h.analytics.event({
                                    cat: 'project_view', act: 'project_contribsuggestions_view', project: project() })
                            }, 'Valores Sugeridos'),
                            m(`a[id="about-link"][class="dashboard-nav-link mf ${(h.hashMatch('#about') || (!h.mobileScreen() && h.hashMatch('')) ? 'selected' : '')}"][href="#about"]`, {
                                style: 'float: left;',
                                onclick: h.analytics.event({
                                    cat: 'project_view', act: 'project_about_view', project: project() })
                            }, 'Sobre'),
                            m(`a[id="posts-link"][class="dashboard-nav-link mf ${(h.hashMatch('#posts') ? 'selected' : '')}"][href="/${project().permalink}#posts"]`, {
                                style: 'float: left;',
                                onclick: h.analytics.event({
                                    cat: 'project_view', act: 'project_posts_view', project: project() })
                            }, [
                                'Novidades ',
                                m('span.badge', project() ? project().posts_count : '')
                            ]),
                            m(`a[id="contributions-link"][class="w-hidden-small w-hidden-tiny dashboard-nav-link mf ${(h.hashMatch('#contributions') ? 'selected' : '')}"][href="#contributions"]`, {
                                style: 'float: left;',
                                onclick: h.analytics.event({
                                    cat: 'project_view', act: 'project_contributions_view', project: project() })
                            }, projectVM.isSubscription(project) ? [
                                'Assinantes ',
                                m('span.badge.w-hidden-small.w-hidden-tiny', args.subscriptionData() ? args.subscriptionData().total_subscriptions : '-')
                            ] : [
                                'Apoiadores ',
                                m('span.badge.w-hidden-small.w-hidden-tiny', project() ? project().total_contributors : '-')
                            ]
                            ),
                            m(`a[id="comments-link"][class="dashboard-nav-link mf ${(h.hashMatch('#comments') ? 'selected' : '')}"][href="#comments"]`, {
                                style: 'float: left;',
                                onclick: h.analytics.event({
                                    cat: 'project_view', act: 'project_comments_view', project: project() })
                            }, [
                                'Comentários ',
                                project() ? m(`fb:comments-count[href="http://www.catarse.me/${project().permalink}"][class="badge project-fb-comment w-hidden-small w-hidden-tiny"][style="display: inline"]`, m.trust('&nbsp;')) : '-'
                            ]),
                        ]),
                        project() ? m('.w-col.w-col-4.w-hidden-small.w-hidden-tiny', project().open_for_contributions && !args.hasSubscription() ? [
                            m('.w-row.project-nav-back-button', [
                                projectVM.isSubscription(project) ? m('.w-col.w-col-12', [
                                    m(`a.w-button.btn[href="/projects/${project().project_id}/subscriptions/start"]`, {
                                        onclick: h.analytics.event({ cat: 'contribution_create', act: 'contribution_floatingbtn_click', project: project() }, ctrl.navigate)
                                    }, window.I18n.t(`submit_${project().mode}`, I18nScope()))
                                ]) : m('.w-col.w-col-6.w-col-medium-8', [
                                    m(`a.w-button.btn[href="/projects/${project().project_id}/contributions/new"]`, {
                                        onclick: h.analytics.event({ cat: 'contribution_create', act: 'contribution_floatingbtn_click', project: project() })
                                    }, 'Apoiar ‍este projeto')
                                ]),
                                m('.w-col.w-col-6.w-col-medium-4', {
                                    onclick: h.analytics.event({ cat: 'project_view', act: 'project_floatingreminder_click', project: project() })
                                }, [
                                    projectVM.isSubscription(project) ? null : m.component(projectReminder, { project, type: 'button', hideTextOnMobile: true })
                                ])
                            ])
                        ] : '') : ''
                    ])
                ])
            ]),
            (ctrl.isFixed() && !project().is_owner_or_admin) ? m('.w-section.project-nav') : ''
        ] : '');
    }
};

export default projectTabs;
