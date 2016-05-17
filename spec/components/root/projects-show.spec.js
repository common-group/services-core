import projectsShow from '../../../src/root/projects-show';

export default describe('ProjectsShow', () => {
  let $output, projectDetail;

  beforeAll(() => {
    window.location.hash = '';
    projectDetail = ProjectDetailsMockery()[0];
    let component = m.component(projectsShow, {project_id: 123, project_user_id: 1231}),
        view = component.view(component.controller());
    $output = mq(view);
  });

  it('should render project some details', () => {
    expect($output.contains(projectDetail.name)).toEqual(true);
    $output.should.have('#project-sidebar');
    $output.should.have('#project-header');
    $output.should.have('.project-highlight');
    $output.should.have('.project-nav');
    $output.should.have('#rewards');
  });
});
