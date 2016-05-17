import liveStatistics from '../../../src/root/live-statistics';
import h from '../../../src/h';

export default describe('pages.LiveStatistics', () => {
  let $output, statistic;

  describe('view', () => {
    beforeAll(() => {
      statistic = StatisticMockery()[0];
      let component = m.component(liveStatistics);
      $output = mq(component.view(component.controller(), {}));
    });

    it('should render statistics', () => {
      expect($output.contains(h.formatNumber(statistic.total_contributed, 2, 3))).toEqual(true);
      expect($output.contains(statistic.total_contributors)).toEqual(true);
    });
  });
});
