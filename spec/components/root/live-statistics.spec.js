describe('pages.LiveStatistics', () => {
  let $output, statistic,
      LiveStatistics = window.c.pages.LiveStatistics;

  describe('view', () => {
    beforeAll(() => {
      statistic = StatisticMockery()[0];
      let component = m.component(LiveStatistics);
      $output = mq(component.view(component.controller(), {}));
    });

    it('should render statistics', () => {
      expect($output.contains(window.c.h.formatNumber(statistic.total_contributed, 2, 3))).toEqual(true);
      expect($output.contains(statistic.total_contributors)).toEqual(true);
    });
  });
});

