import postgrest from 'mithril-postgrest';

const models = {
    contributionDetail: postgrest.model('contribution_details'),
    contributionActivity: postgrest.model('contribution_activities'),
    projectDetail: postgrest.model('project_details'),
    userDetail: postgrest.model('user_details'),
    balance: postgrest.model('balances'),
    balanceTransaction: postgrest.model('balance_transactions'),
    balanceTransfer: postgrest.model('balance_transfers'),
    user: postgrest.model('users'),
    bankAccount: postgrest.model('bank_accounts'),
    rewardDetail: postgrest.model('reward_details'),
    projectReminder: postgrest.model('project_reminders'),
    projectReport: postgrest.model('project_reports'),
    contributions: postgrest.model('contributions'),
    directMessage: postgrest.model('direct_messages'),
    teamTotal: postgrest.model('team_totals'),
    projectAccount: postgrest.model('project_accounts'),
    projectAccountError: postgrest.model('project_account_errors'),
    projectContribution: postgrest.model('project_contributions'),
    projectPostDetail: postgrest.model('project_posts_details'),
    projectContributionsPerDay: postgrest.model('project_contributions_per_day'),
    projectContributionsPerLocation: postgrest.model('project_contributions_per_location'),
    projectContributionsPerRef: postgrest.model('project_contributions_per_ref'),
    projectTransfer: postgrest.model('project_transfers'),
    project: postgrest.model('projects'),
    projectSearch: postgrest.model('rpc/project_search'),
    category: postgrest.model('categories'),
    categoryTotals: postgrest.model('category_totals'),
    categoryFollower: postgrest.model('category_followers'),
    teamMember: postgrest.model('team_members'),
    notification: postgrest.model('notifications'),
    statistic: postgrest.model('statistics'),
    successfulProject: postgrest.model('successful_projects'),
    finishedProject: postgrest.model('finished_projects'),
    userFriend: postgrest.model('user_friends'),
    userFollow: postgrest.model('user_follows'),
    followAllFriends: postgrest.model('rpc/follow_all_friends')
};

models.teamMember.pageSize(40);
models.rewardDetail.pageSize(false);
models.project.pageSize(30);
models.category.pageSize(50);
models.contributionActivity.pageSize(40);
models.successfulProject.pageSize(9);
models.finishedProject.pageSize(9);

export default models;
