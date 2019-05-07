import mq from 'mithril-query';
import m from 'mithril';
import prop from 'mithril/stream';
import adminNotificationHistory from '../../src/c/admin-notification-history';

describe('AdminNotificationHistory', () => {
    let user, historyBox,
        ctrl, view, $output;

    beforeAll(() => {
        user = prop(UserDetailMockery(1));
        $output = mq(adminNotificationHistory, {user: user()[0]});
    });

    describe('view', () => {
        it('should render fetched notifications', () => {
            setTimeout(() => {
                expect($output.find('.date-event').length).toEqual(1);
            }, 200);
        });
    });
});
