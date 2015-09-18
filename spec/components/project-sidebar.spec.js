describe('ProjectSidebar', () => {
  let generateContextByNewState,
      ProjectSidebar = window.c.ProjectSidebar;

  describe('view', () => {
    beforeAll(() => {
      generateContextByNewState = (newState = {}) => {
        spyOn(m, 'component').and.callThrough();
        let projectDetail = _.extend({}, ProjectDetailsMockery()[0], newState),
            component = m.component(ProjectSidebar, {project: projectDetail, userDetails: m.prop([])}),
            ctrl = component.controller({project: projectDetail, userDetails: m.prop([])}),
            view = component.view(component.controller(), {project: projectDetail, userDetails: m.prop([])});

        spyOn(ctrl, 'displayCardClass').and.callThrough();
        spyOn(ctrl, 'displayStatusText').and.callThrough();

        return {
          output: mq(view),
          ctrl: ctrl,
          projectDetail: projectDetail
        };
      };
    });

    it('should render project stats', () => {
      let {output, projectDetail} = generateContextByNewState({state: 'successful'});

      expect(output.find('#project-sidebar.aside').length).toEqual(1);
      expect(output.find('.card-success').length).toEqual(1);
      expect(output.contains('atingidos de R$ ' + window.c.h.formatNumber(projectDetail.goal))).toEqual(true);
    });
  });
});


