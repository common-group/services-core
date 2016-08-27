import m from 'mithril';
import _ from 'underscore';
import postgrest from 'mithril-postgrest';
import h from '../h';
import models from '../models';


const idVM = h.idVM,
      userDetails = m.prop([]),
      currentUser = m.prop(),
      createdVM = postgrest.filtersVM({user_id: 'eq'});

const getUserCreatedProjects = (user_id) => {
    createdVM.user_id(user_id).order({project_id: 'desc'});

    models.projectDetail.pageSize(3);

    const lUserCreated = postgrest.loaderWithToken(models.projectDetail.getPageOptions(createdVM.parameters()));

    return lUserCreated.load();
};

const getUserContributedProjects = (user_id) => {
    const contextVM = postgrest.filtersVM({
        user_id: 'eq',
        state: 'in'
    });

    contextVM.user_id(user_id).order({
        created_at: 'desc'
    }).state(['refunded', 'pending_refund', 'paid']);

    models.userContribution.pageSize(3);

    const lUserContributed = postgrest.loaderWithToken(
        models.userContribution.getPageOptions(contextVM.parameters()));

    return lUserContributed.load();
};


const fetchUser = (user_id, handlePromise = true, customProp = currentUser) => {
    idVM.id(user_id);

    const lUser = postgrest.loaderWithToken(models.userDetail.getRowOptions(idVM.parameters()));

    return !handlePromise ? lUser.load() : lUser.load().then(_.compose(customProp, _.first));
};

const userVM = {
    getUserCreatedProjects: getUserCreatedProjects,
    getUserContributedProjects: getUserContributedProjects,
    currentUser: currentUser,
    fetchUser: fetchUser
};

export default userVM;
