window.c.models = (function(m){
  var contributionDetail = m.postgrest.model('contribution_details'),

  projectDetail = m.postgrest.model('project_details'),
  contributions = m.postgrest.model('contributions'),
  teamTotal = m.postgrest.model('team_totals'),
  projectContributionsPerDay = m.postgrest.model('project_contributions_per_day'),
  projectContributionsPerLocation = m.postgrest.model('project_contributions_per_location'),
  project = m.postgrest.model('projects'),
  projectsForHome = m.postgrest.model('projects_for_home'),
  teamMember = m.postgrest.model('team_members');
  teamMember.pageSize(40);
  project.pageSize(3);
  projectsForHome.pageSize(9);

  return {
    contributionDetail: contributionDetail,
    projectDetail: projectDetail,
    contributions: contributions,
    teamTotal: teamTotal,
    teamMember: teamMember,
    project: project,
    projectsForHome: projectsForHome,
    projectContributionsPerDay: projectContributionsPerDay,
    projectContributionsPerLocation: projectContributionsPerLocation
  };
}(window.m));
