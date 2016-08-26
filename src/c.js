import adminUsers from './root/admin-users';
import adminContributions from './root/admin-contributions';
import flex from './root/flex';
import insights from './root/insights';
import jobs from './root/jobs';
import liveStatistics from './root/live-statistics';
import projectsContributionReport from './root/projects-contribution-report';
import projectsDashboard from './root/projects-dashboard';
import projectsExplore from './root/projects-explore';
import projectsHome from './root/projects-home';
import projectsShow from './root/projects-show';
import projectsPayment from './root/projects-payment';
import projectsReward from './root/projects-reward';
import publish from './root/publish';
import start from './root/start';
import team from './root/team';
import usersBalanceMain from './root/users-balance-main';
import menu from './root/menu';
import footer from './root/footer';
import FollowFoundFriends from './root/follow-found-friends';


const c = {
    root: {
        AdminUsers: adminUsers,
        AdminContributions: adminContributions,
        Flex: flex,
        Insights: insights,
        Jobs: jobs,
        LiveStatistics: liveStatistics,
        ProjectsContributionReport: projectsContributionReport,
        ProjectsDashboard: projectsDashboard,
        ProjectsExplore: projectsExplore,
        ProjectsHome: projectsHome,
        ProjectsShow: projectsShow,
        ProjectsPayment: projectsPayment,
        ProjectsReward: projectsReward,
        Publish: publish,
        Start: start,
        Team: team,
        UsersBalance: usersBalanceMain,
        Menu: menu,
        Footer: footer,
        FollowFoundFriends: FollowFoundFriends
    }
};

export default c;
