window.c.models = (function(m){
  var contributionDetail = m.postgrest.model('contribution_details'),

  projectDetail = m.postgrest.model('project_details'),

  teamTotal = m.postgrest.model('team_totals', [
    'member_count', 'countries', 'total_contributed_projects',
    'total_cities', 'total_amount'
  ]),

  teamMember = m.postgrest.model('team_members');
  teamMember.pageSize(40);

  return {
    contributionDetail: contributionDetail,
    projectDetail: projectDetail,
    teamTotal: teamTotal,
    teamMember: teamMember
  };
}(window.m));

