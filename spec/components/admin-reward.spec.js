import adminReward from '../../src/c/admin-reward';

describe('adminReward', () => {
    let ctrl, $output;

    describe('view', () => {
        let reward, ctrl;

        describe("when contribution has no reward", function() {
            beforeAll(() => {
                $output = mq(adminReward.view(undefined, {
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
                $output = mq(adminReward.view(undefined, {
                    reward: reward
                }));
            });

            it("should render reward description when we have a reward_id", function() {
                $output.should.contain(reward().description);
            });
        });
    });
});
