import mq from 'mithril-query';
import usersShow from '../../../src/root/users-show';

describe('UsersShow', () => {
  let $output, userDetail;

  beforeAll(() => {
    window.location.hash = '';
    userDetail = UserDetailMockery()[0];
    $output = mq(m(usersShow, {user_id: '405699'}));
  });

  it('should render some user details', () => {
    $output.should.have('#contributed_link');
    $output.should.have('#created_link');
    $output.should.have('#about_link');
    
    expect($output.contains(userDetail.name)).toEqual(true);
  });
});
