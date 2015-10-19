describe('AdminReward', () => {
    let ctrl,
        $output,
        c = window.c,
        AdminReward = c.AdminReward;

    describe('view', () => {
        let reward, ctrl;

        describe("when contribution has no reward", function() {
            beforeAll(() => {
                $output = mq(AdminReward.view(undefined, {
                    reward: m.prop({})
                }));
            });

            it('should render "no reward" text when reward_id is null', () => {
                $output.should.contain('Apoio sem recompensa');
            });
        });

        describe("when contribution has reward", function() {
            let reward;

            beforeAll(() => {
                reward = m.prop(RewardDetailsMockery()[0]);
                $output = mq(AdminReward.view(undefined, {
                    reward: reward
                }));
            });

            it("should render reward description when we have a reward_id", function() {
                $output.should.contain(reward().description);
            });
        });
    });
});