import adminUsers from './root/admin-users';
import adminProjects from './root/admin-projects';
import adminContributions from './root/admin-contributions';
import adminBalanceTranfers from './root/admin-balance-tranfers';
import flex from './root/flex';
import insights from './root/insights';
import posts from './root/posts';
import surveys from './root/surveys';
import surveyCreate from './root/survey-create';
import jobs from './root/jobs';
import press from './root/press';
import liveStatistics from './root/live-statistics';
import projectsContributionReport from './root/projects-contribution-report';
import projectsDashboard from './root/projects-dashboard';
import projectsExplore from './root/projects-explore';
import projectsHome from './root/projects-home';
import projectsShow from './root/projects-show';
import projectsContribution from './root/projects-contribution';
import usersShow from './root/users-show';
import surveysShow from './root/surveys-show';
import usersEdit from './root/users-edit';
import projectEdit from './root/project-edit';
import projectsPayment from './root/projects-payment';
import projectsReward from './root/projects-reward';
import publish from './root/publish';
import start from './root/start';
import team from './root/team';
import menu from './root/menu';
import footer from './root/footer';
import FollowFoundFriends from './root/follow-found-friends';
import thankYou from './root/thank-you';
import CheckEmail from './root/check-email';
import projectEditUserAbout from './root/project-edit-user-about';
import projectEditReward from './root/project-edit-reward';
import projectEditUserSettings from './root/project-edit-user-settings';
import projectEditBasic from './root/project-edit-basic';
import projectEditDescription from './root/project-edit-description';
import projectEditBudget from './root/project-edit-budget';
import projectEditVideo from './root/project-edit-video';
import projectEditGoal from './root/project-edit-goal';
import projectEditCard from './root/project-edit-card';
import copyTextInput from './c/copy-text-input';

const c = {
    root: {
        AdminUsers: adminUsers,
        AdminProjects: adminProjects,
        AdminContributions: adminContributions,
        AdminBalanceTranfers: adminBalanceTranfers,
        ClipboardCopy: copyTextInput,
        Flex: flex,
        Insights: insights,
        Posts: posts,
        Surveys: surveys,
        Jobs: jobs,
        LiveStatistics: liveStatistics,
        ProjectsContributionReport: projectsContributionReport,
        ProjectsDashboard: projectsDashboard,
        ProjectsExplore: projectsExplore,
        ProjectsHome: projectsHome,
        ProjectsShow: projectsShow,
        UsersShow: usersShow,
        SurveysShow: surveysShow,
        UsersEdit: usersEdit,
        ProjectEdit: projectEdit,
        SurveyCreate: surveyCreate,
        ProjectsContribution: projectsContribution,
        ProjectsPayment: projectsPayment,
        ProjectsReward: projectsReward,
        ThankYou: thankYou,
        Publish: publish,
        Start: start,
        Team: team,
        Menu: menu,
        Press: press,
        Footer: footer,
        FollowFoundFriends,
        CheckEmail,
        projectEditUserAbout,
        projectEditUserSettings,
        projectEditReward,
        projectEditBasic,
        projectEditDescription,
        projectEditBudget,
        projectEditVideo,
        projectEditGoal,
        projectEditCard
    }
};

export default c;
