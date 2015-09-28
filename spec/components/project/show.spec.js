describe('ProjectShow', () => {
  let $output, projectDetail,
      ProjectShow = window.c.project.Show;

  beforeAll(() => {
    projectDetail = ProjectDetailsMockery()[0];
    let component = m.component(ProjectShow, {project_id: 123}),
        view = component.view(component.controller());
    $output = mq(view);
  });

  it('should render project some details', () => {
    expect($output.contains(projectDetail.name)).toEqual(true);
    expect($output.find('#project-sidebar').length).toEqual(1);
    expect($output.find('#project-header').length).toEqual(1);
    expect($output.find('.project-highlight').length).toEqual(1);
    expect($output.find('.project-nav.mf').length).toEqual(1);
    expect($output.find('#rewards').length).toEqual(1);
  });
});
