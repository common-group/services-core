import postgrest from 'mithril-postgrest';

const models = {
    country: postgrest.model('countries'),
    state: postgrest.model('states'),
    contributionDetail: postgrest.model('contribution_details'),
    contributionActivity: postgrest.model('contribution_activities'),
    projectDetail: postgrest.model('project_details'),
    userDetail: postgrest.model('user_details'),
    balance: postgrest.model('balances'),
    balanceTransaction: postgrest.model('balance_transactions'),
    balanceTransfer: postgrest.model('balance_transfers'),
    user: postgrest.model('users'),
    survey: postgrest.model('surveys'),
    userCreditCard: postgrest.model('user_credit_cards'),
    bankAccount: postgrest.model('bank_accounts'),
    bank: postgrest.model('banks'),
    rewardDetail: postgrest.model('reward_details'),
    projectReminder: postgrest.model('project_reminders'),
    projectReport: postgrest.model('project_reports'),
    contributions: postgrest.model('contributions'),
    directMessage: postgrest.model('direct_messages'),
    teamTotal: postgrest.model('team_totals'),
    recommendedProjects: postgrest.model('recommended_projects'),
    projectAccount: postgrest.model('project_accounts'),
    projectAccountError: postgrest.model('project_account_errors'),
    projectContribution: postgrest.model('project_contributions'),
    projectContributiorsStat: postgrest.model('project_stat_contributors'),
    projectPostDetail: postgrest.model('project_posts_details'),
    projectContributionsPerDay: postgrest.model('project_contributions_per_day'),
    projectContributionsPerLocation: postgrest.model('project_contributions_per_location'),
    projectContributionsPerRef: postgrest.model('project_contributions_per_ref'),
    projectVisitorsPerDay: postgrest.model('project_visitors_per_day'),
    projectTransfer: postgrest.model('project_transfers'),
    project: postgrest.model('projects'),
    adminProject: postgrest.model('admin_projects'),
    projectSearch: postgrest.model('rpc/project_search'),
    publicTags: postgrest.model('public_tags'),
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
    followAllCreators: postgrest.model('rpc/follow_all_creators'),
    sentSurveyCount: postgrest.model('rpc/sent_survey_count'),
    answeredSurveyCount: postgrest.model('rpc/answered_survey_count'),
    followAllFriends: postgrest.model('rpc/follow_all_friends'),
    contributor: postgrest.model('contributors'),
    userFollower: postgrest.model('user_followers'),
    creatorSuggestion: postgrest.model('creator_suggestions'),
    userContribution: postgrest.model('user_contributions'),
    shippingFee: postgrest.model('shipping_fees'),
    deleteProject: postgrest.model('rpc/delete_project'),
    cancelProject: postgrest.model('rpc/cancel_project'),
    city: postgrest.model('cities'),
    mailMarketingList: postgrest.model('mail_marketing_lists')
};

models.teamMember.pageSize(40);
models.rewardDetail.pageSize(false);
models.shippingFee.pageSize(false);
models.projectReminder.pageSize(false);
models.project.pageSize(30);
models.category.pageSize(50);
models.contributionActivity.pageSize(40);
models.successfulProject.pageSize(9);
models.finishedProject.pageSize(9);
models.country.pageSize(false);
models.state.pageSize(false);
models.publicTags.pageSize(false);
models.projectContribution.pageSize(9);
models.contributor.pageSize(9);
models.recommendedProjects.pageSize(3);
models.bank.pageSize(400);
models.city.pageSize(200);
models.balanceTransfer.pageSize(9);


export default models;
