import m from 'mithril';
import _ from 'underscore';
import I18n from 'i18n-js';
import h from '../h';
import projectVM from '../vms/project-vm';
// @TODO move all tabs to c/
// using the inside components that root tabs use
import projectEditGoal from '../root/project-edit-goal';
import projectEditBasic from '../root/project-edit-basic';
import projectEditDescription from '../root/project-edit-description';
import projectEditVideo from '../root/project-edit-video';
import projectEditBudget from '../root/project-edit-budget';
import projectEditUserAbout from '../root/project-edit-user-about';
import projectEditUserSettings from '../root/project-edit-user-settings';
import projectEditReward from '../root/project-edit-reward';
import projectEditCard from '../root/project-edit-card';
import projectPreview from '../root/project-preview';
import projectDashboardMenu from '../c/project-dashboard-menu';
import projectAnnounceExpiration from '../c/project-announce-expiration';
import projectEditTab from '../c/project-edit-tab';

const I18nScope = _.partial(h.i18nScope, 'projects.edit');

const projectEdit = {
    controller(args) {
        const { project_id, user_id } = args;

        const project = projectVM.fetchProject(project_id),
            hash = m.prop(window.location.hash),
            displayTabContent = () => {
                const c_opts = {
                    project_id,
                    user_id,
                    project
                },
                    tabs = {
                        '#video': m(projectEditTab, {
                            title: I18n.t('video_html', I18nScope()),
                            subtitle: I18n.t('video_subtitle', I18nScope()),
                            content: m(projectEditVideo, _.extend({}, c_opts))
                        }),
                        '#description': m(projectEditTab, {
                            title: I18n.t('description', I18nScope()),
                            subtitle: I18n.t('description_subtitle', I18nScope()),
                            content: m(projectEditDescription, _.extend({},
                                c_opts))
                        }),
                        '#budget': m(projectEditTab, {
                            title: I18n.t('budget', I18nScope()),
                            subtitle: I18n.t('budget_subtitle', I18nScope()),
                            content: m(projectEditBudget, _.extend({}, c_opts))
                        }),
                        '#reward': m(projectEditTab, {
                            title: I18n.t('reward_html', I18nScope()),
                            subtitle: I18n.t('reward_subtitle', I18nScope()),
                            content: m(projectEditReward, _.extend({}, c_opts))
                        }),
                        '#user_settings': m(projectEditTab, {
                            title: I18n.t('user_settings', I18nScope()),
                            subtitle: I18n.t('user_settings_subtitle', I18nScope()),
                            content: m(projectEditUserSettings, _.extend({}, c_opts))
                        }),
                        '#user_about': m(projectEditTab, {
                            title: I18n.t('user_about', I18nScope()),
                            subtitle: I18n.t('user_about_subtitle', I18nScope()),
                            content: m(projectEditUserAbout, _.extend({}, c_opts))
                        }),
                        '#card': m(projectEditTab, {
                            title: I18n.t('card', I18nScope()),
                            subtitle: I18n.t('card_subtitle', I18nScope()),
                            content: m(projectEditCard, _.extend({}, c_opts))
                        }),
                        '#basics': m(projectEditTab, {
                            title: I18n.t('basics', I18nScope()),
                            subtitle: I18n.t('basics_subtitle', I18nScope()),
                            content: m(projectEditBasic, _.extend({}, c_opts))
                        }),
                        '#goal': m(projectEditTab, {
                            title: I18n.t('goal', I18nScope()),
                            subtitle: I18n.t('goal_subtitle', I18nScope()),
                            content: m(projectEditGoal, _.extend({}, c_opts))
                        }),
                        '#announce_expiration': m(projectEditTab, {
                            title: I18n.t('announce_expiration', I18nScope()),
                            subtitle: I18n.t('announce_expiration_subtitle', I18nScope()),
                            content: m(projectAnnounceExpiration, _.extend({}, c_opts))
                        }),
                        '#preview': m(projectPreview, _.extend({}, c_opts))
                    };

                hash(window.location.hash);

                if (_.isEmpty(hash()) || hash() === '#_=_') {
                    return tabs['#basics'];
                }

                return tabs[hash()];
            };

        h.redrawHashChange();
        return {
            displayTabContent,
            hash,
            project
        };
    },
    view(ctrl, args) {
        const project = ctrl.project;

        return m('.project-dashboard-edit', (project() ? [
            m(`.w-section.section-product.${project().mode}`),
            ctrl.displayTabContent(),
            (project() ? m.component(projectDashboardMenu, {
                project
            }) : '')
        ] : ''));
    }
};

export default projectEdit;
