describe('ProjectContributionsPerLocationTable', () =>{
  var ProjectContributionsPerLocationTable = window.c.ProjectContributionsPerLocationTable,
      $output;

  describe('view', () => {
    beforeAll(() => {
      $output = mq(m.component(ProjectContributionsPerLocationTable, {resourceId: 1234}));
    });

    it('should render states', () => {
      expect($output.find('.w-row.table-row').length).toEqual(3);
    });
  });
});
