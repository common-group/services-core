describe('TeamMembers', function() {
  var TeamMembers = window.c.TeamMembers;

  describe('view', function() {
    beforeAll(function() {
      $output = mq(TeamMembers);
    });

    it('should render fetched team members', function() {
      expect($output.has('#team-members-static')).toEqual(true);
      expect($output.find('.team-member').length).toEqual(TeamMembersMockery(10).length);
    });
  });
});
