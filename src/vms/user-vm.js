import m from 'mithril';
import _ from 'underscore';
import postgrest from 'mithril-postgrest';
import h from '../h';
import models from '../models';


const idVM = h.idVM,
      userDetails = m.prop([]),
      projectUserDetails = m.prop(),
      createdVM = postgrest.filtersVM({user_id: 'eq'});

const getUserCreatedProjects = (user_id) => {
    createdVM.user_id(user_id).order({project_id: 'desc'});

    models.projectDetail.pageSize(3);

    const lUserCreated = postgrest.loaderWithToken(models.projectDetail.getPageOptions(createdVM.parameters()));

    return lUserCreated.load();
};

const getUserContributedProjects = (user_id) => {

};

const fetchUser = (user_id) => {
    idVM.id(user_id);

    const lUser = postgrest.loaderWithToken(models.userDetail.getRowOptions(idVM.parameters()));

    return lUser.load();
};

const userVM = {
    getUserCreatedProjects: getUserCreatedProjects,
    getUserContributedProjects: getUserContributedProjects,
    projectUserDetails: projectUserDetails,
    fetchUser: fetchUser
};

export default userVM;
