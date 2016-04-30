window.c.models = (function(m) {
    var contributionDetail = m.postgrest.model('contribution_details'),
        contributionActivity = m.postgrest.model('contribution_activities'),
        projectDetail = m.postgrest.model('project_details'),
        userDetail = m.postgrest.model('user_details'),
        balance = m.postgrest.model('balances'),
        balanceTransaction = m.postgrest.model('balance_transactions'),
        balanceTransfer = m.postgrest.model('balance_transfers'),
        user = m.postgrest.model('users'),
        bankAccount = m.postgrest.model('bank_accounts'),
        rewardDetail = m.postgrest.model('reward_details'),
        projectReminder = m.postgrest.model('project_reminders'),
        contributions = m.postgrest.model('contributions'),
        directMessage = m.postgrest.model('direct_messages'),
        teamTotal = m.postgrest.model('team_totals'),
        projectAccount = m.postgrest.model('project_accounts'),
        projectContribution = m.postgrest.model('project_contributions'),
        projectPostDetail = m.postgrest.model('project_posts_details'),
        projectContributionsPerDay = m.postgrest.model('project_contributions_per_day'),
        projectContributionsPerLocation = m.postgrest.model('project_contributions_per_location'),
        projectContributionsPerRef = m.postgrest.model('project_contributions_per_ref'),
        project = m.postgrest.model('projects'),
        projectSearch = m.postgrest.model('rpc/project_search'),
        category = m.postgrest.model('categories'),
        categoryTotals = m.postgrest.model('category_totals'),
        categoryFollower = m.postgrest.model('category_followers'),
        teamMember = m.postgrest.model('team_members'),
        notification = m.postgrest.model('notifications'),
        statistic = m.postgrest.model('statistics'),
        successfulProject = m.postgrest.model('successful_projects'),
        finishedProject = m.postgrest.model('finished_projects'),
        userFriend = m.postgrest.model('user_friends');

    teamMember.pageSize(40);
    rewardDetail.pageSize(false);
    project.pageSize(30);
    category.pageSize(50);
    contributionActivity.pageSize(40);
    successfulProject.pageSize(9);
    finishedProject.pageSize(9);

    return {
        contributionDetail: contributionDetail,
        contributionActivity: contributionActivity,
        projectDetail: projectDetail,
        userDetail: userDetail,
        balance: balance,
        balanceTransaction: balanceTransaction,
        balanceTransfer: balanceTransfer,
        bankAccount: bankAccount,
        user: user,
        rewardDetail: rewardDetail,
        contributions: contributions,
        directMessage: directMessage,
        teamTotal: teamTotal,
        teamMember: teamMember,
        project: project,
        projectSearch: projectSearch,
        category: category,
        categoryTotals: categoryTotals,
        categoryFollower: categoryFollower,
        projectAccount: projectAccount,
        projectContributionsPerDay: projectContributionsPerDay,
        projectContributionsPerLocation: projectContributionsPerLocation,
        projectContributionsPerRef: projectContributionsPerRef,
        projectContribution: projectContribution,
        projectPostDetail: projectPostDetail,
        projectReminder: projectReminder,
        notification: notification,
        statistic: statistic,
        successfulProject: successfulProject,
        finishedProject: finishedProject,
        userFriend: userFriend
    };
}(window.m));
