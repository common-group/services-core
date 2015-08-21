//ProjectContributionsPerLocationMockery
describe('ProjectContributionsPerLocationTable', function(){
  var ProjectContributionsPerLocationTable = window.c.ProjectContributionsPerLocationTable;

  describe('view', function() {
    beforeAll(function() {
      $output = mq(m.component(ProjectContributionsPerLocationTable, {resourceId: 1234}));
    });

    it("should render states", function() {
      expect($output.find('.w-row.table-row').length).toEqual(3);
    });
  });
});
