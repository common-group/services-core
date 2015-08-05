window.models = (function(){
  var contributionDetail = m.postgrest.model('contribution_details', [
    'id','contribution_id','user_id','project_id',
    'reward_id','payment_id','permalink','project_name','project_img',
    'user_name','user_profile_img','email','key','value',
    'installments','installment_value','state','anonymous',
    'payer_email','gateway','gateway_id','gateway_fee',
    'gateway_data','payment_method','project_state',
    'has_rewards','pending_at','paid_at','refused_at', 'reward_minimum_value',
    'pending_refund_at','refunded_at','created_at', 'is_second_slip'
  ]),

  teamTotal = m.postgrest.model('team_totals', [
    "member_count", "countries", "total_contributed_projects",
    "total_cities", "total_amount"
  ]),

  teamMember = m.postgrest.model('team_members', [
    "name", "img", "id",
    "total_contributed_projects", "total_amount_contributed"
  ]);
  teamMember.pageSize(40);

  return {
    contributionDetail: contributionDetail,
    teamTotal: teamTotal,
    teamMember: teamMember
  };
}());

