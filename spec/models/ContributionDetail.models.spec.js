describe('ContributionDetail model', function() {
  beforeAll(function(){
    this.contribution_mock = {
      id : 1,
      contribution_id : 2,
      user_id : 3,
      project_id : 4,
      reward_id : 5,
      payment_id : 6,
      permalink : 'fake_project',
      project_name : 'Fake Project',
      user_name : 'Fake User',
      email : 'fake@user.com',
      uploaded_image : 'fake.jpg',
      contribution_key : "3",
      contribution_value : 20,
      installments : 1,
      installment_value : 20,
      state : 'paid',
      anonymous : false,
      payer_email : 'fake@user.com',
      gateway : 'MoIP',
      gateway_id : null,
      gateway_fee : null,
      gateway_data : {},
      payment_method : 'Desconhecido',
      project_state : 'successful',
      has_rewards : true,
      pending_at : '011-01-16T17:25:56.611561',
      paid_at : '011-01-16T17:25:56.611561',
      refused_at : null,
      pending_refund_at : null,
      created_at : '011-01-16T17:25:56.611561',
    };
  });

  describe('when instantiated', function() {
    beforeAll(function() {
      this.contribution = new adminApp.models.ContributionDetail(this.contribution_mock);
    });

    it('should exhibit attributes', function() {
      expect(this.contribution).toMatchPropertiesOf(this.contribution_mock);
    });
  });

  describe('helper functions', function() {
    it('should instantiate a get function', function() {
      expect(typeof adminApp.models.ContributionDetail.get).toBe('function');
    });
  });

});