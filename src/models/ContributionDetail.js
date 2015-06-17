var ContributionDetail = function(data){
  data = data || {};  
  this.id = m.prop(data.id);
  this.contribution_id = m.prop(data.contribution_id);
  this.user_id = m.prop(data.user_id);
  this.project_id = m.prop(data.project_id);
  this.reward_id = m.prop(data.reward_id);
  this.payment_id = m.prop(data.payment_id);
  this.permalink = m.prop(data.permalink);
  this.project_name = m.prop(data.project_name);
  this.user_name = m.prop(data.user_name);
  this.email = m.prop(data.email);
  this.uploaded_image = m.prop(data.uploaded_image);
  this.key = m.prop(data.key);
  this.value = m.prop(data.value);
  this.installments = m.prop(data.installments);
  this.installment_value = m.prop(data.installment_value);
  this.state = m.prop(data.state);
  this.anonymous = m.prop(data.anonymous);
  this.payer_email = m.prop(data.payer_email);
  this.gateway = m.prop(data.gateway);
  this.gateway_id = m.prop(data.gateway_id);
  this.gateway_fee = m.prop(data.gateway_fee);
  this.gateway_data = m.prop(data.gateway_data);
  this.payment_method = m.prop(data.payment_method);
  this.project_state = m.prop(data.project_state);
  this.has_rewards = m.prop(data.has_rewards);
  this.pending_at = m.prop(data.pending_at);
  this.paid_at = m.prop(data.paid_at);
  this.refused_at = m.prop(data.refused_at);
  this.pending_refund_at = m.prop(data.pending_refund_at);
  this.refunded_at = m.prop(data.refunded_at);
  this.created_at = m.prop(data.created_at);
};

ContributionDetail.get = function(filter){
  return [];
  //return m.postgrest.request({method: "GET", url: "/contribution_details", data: filter});
};

adminApp.models.ContributionDetail = ContributionDetail;