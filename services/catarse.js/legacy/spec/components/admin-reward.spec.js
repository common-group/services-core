import mq from 'mithril-query';
import adminReward from '../../src/c/admin-reward';

describe('adminReward', () => {
    let ctrl, $output;

    describe('view', () => {
        let reward, ctrl;

        describe("when contribution has no reward", function() {
            beforeAll(() => {
                ctrl = adminReward.controller({
                    reward: prop({}),
                    contribution: prop({})
                });
                $output = mq(adminReward.view(ctrl, {
                    reward: prop({}),
                    contribution: prop({})
                }));
            });

            it('should render "no reward" text when reward_id is null', () => {
                $output.should.contain('Apoio sem recompensa');
            });
        });
        describe("when contribution has reward", function() {
            let reward, contribution;

            beforeAll(() => {
                reward = prop(RewardDetailsMockery()[0]);
                contribution = prop(ContributionAttrMockery()[0]);
                ctrl = adminReward.controller({
                    reward: reward,
                    contribution: contribution
                });
                $output = mq(adminReward.view(ctrl, {
                    reward: reward,
                    contribution: contribution
                }));
            });

            it("should render reward description when we have a reward_id", function() {
                $output.should.contain(reward().description);
            });
        });
    });
});
