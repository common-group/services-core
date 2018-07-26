import usersShow from '../../../src/root/users-show';

describe('UsersShow', () => {
  let $output, userDetail;

  beforeAll(() => {
    window.location.hash = '';
    userDetail = UserDetailMockery()[0];
    let component = m.component(usersShow, {user_id: '405699'}),
        view = component.view(component.controller());
    $output = mq(view);
  });

  it('should render some user details', () => {
    expect($output.contains(userDetail.name)).toEqual(true);
    $output.should.have('#contributed_link');
    $output.should.have('#created_link');
    $output.should.have('#about_link');
  });
});
