describe('ProjectRow', () => {
  var $output,
      ProjectRow = window.c.ProjectRow;

  describe('view', () => {
    let collection = {
      title: 'test collection',
      hash: 'testhash',
      collection: m.prop([])
    };

    describe('when collection is empty', () => {
      beforeAll(() => {
        let component = m.component(ProjectRow),
            view = component.view(null, {collection: collection});
        $output = mq(view);
      });

      it('should not render row', () => {
        expect($output.find('.w-section').length).toEqual(0);
      });
    });

    describe('when collection has projects', () => {
      beforeAll(() => {
        collection.collection(ProjectMockery());
        let component = m.component(ProjectRow),
            view = component.view(null, {collection: collection});
        $output = mq(view);
      });

      it('should render projects in row', () => {
        expect($output.find('.w-section').length).toEqual(1);
      });
    });

  });
});
