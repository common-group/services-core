describe('AdminReward', () => {
  let ctrl,
      $output,
      args = {contribution: {reward_id: 1}},
      c = window.c,
      AdminReward = c.AdminReward;

  describe('view', () => {
    let reward, ctrl;

    describe("when contribution has no reward", function() {
      beforeAll(() => {
        $output = mq(AdminReward, {contribution: {}});
      });

      it('should render "no reward" text when reward_id is null', () => {
        $output.should.contain('Apoio sem recompensa');
      });
    });

    describe("when contribution has reward", function() {
      beforeAll(() => {
        $output = mq(AdminReward, args);
        let lastRequest = jasmine.Ajax.requests.mostRecent();
        reward = JSON.parse(lastRequest.responseText)[0];
        console.log(JSON.stringify($output));
      });

      it("should render reward description when we have a reward_id", function() {
        $output.should.contain(reward.description);
      });
    });
  });
});
