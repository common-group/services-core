describe('ProjectRow', function() {
  var ProjectRow = window.c.ProjectRow;

  describe('view', function() {
    var collection = {
      title: 'test collection',
      hash: 'testhash',
      collection: m.prop([])
    };

    describe('when collection is empty', function() {
      beforeAll(function() {
        component = m.component(ProjectRow);
        view = component.view(null, {collection: collection});
        $output = mq(view);
      });

      it("should not render row", function() {
        expect($output.find('.w-section').length).toEqual(0);
      });
    });

    describe('when collection has projects', function() {
      beforeAll(function() {
        collection.collection(ProjectMockery());
        component = m.component(ProjectRow);
        view = component.view(null, {collection: collection});
        $output = mq(view);
      });

      it("should render projects in row", function() {
        expect($output.find('.w-section').length).toEqual(1);
      });
      
    });

  });
});





