import m from 'mithril';
import _ from 'underscore';
import postgrest from 'mithril-postgrest';
import h from '../h';
import models from '../models';

const idVM = h.idVM,
      userDetails = m.prop([]),
      currentUser = m.prop(),
      createdVM = postgrest.filtersVM({project_user_id: 'eq'});

const getUserCreatedProjects = (user_id, pageSize = 3) => {
    createdVM.project_user_id(user_id).order({project_id: 'desc'});

    if(pageSize !== null){
      models.projectDetail.pageSize(pageSize);
    }

    const lUserCreated = postgrest.loaderWithToken(models.project.getPageOptions(createdVM.parameters()));

    return lUserCreated.load();
};

const getUserContributedProjects = (user_id, pageSize = 3) => {
    const contextVM = postgrest.filtersVM({
        user_id: 'eq',
        state: 'in'
    });

    contextVM.user_id(user_id).order({
        created_at: 'desc'
    }).state(['refunded', 'pending_refund', 'paid']);

    if(pageSize !== null){
      models.userContribution.pageSize(pageSize);
    }

    const lUserContributed = postgrest.loaderWithToken(
        models.userContribution.getPageOptions(contextVM.parameters()));

    return lUserContributed.load();
};

const fetchUser = (user_id, handlePromise = true, customProp = currentUser) => {
    idVM.id(user_id);

    const lUser = postgrest.loaderWithToken(models.userDetail.getRowOptions(idVM.parameters()));

    return !handlePromise ? lUser.load() : lUser.load().then(_.compose(customProp, _.first));
};

const displayImage = (user) => {
  return user.profile_img_thumbnail || "https://catarse.me/assets/catarse_bootstrap/user.jpg";
};

const displayCover = (user) => {
  return user.profile_cover_image || displayImage(user);
};

const userVM = {
    getUserCreatedProjects: getUserCreatedProjects,
    getUserContributedProjects: getUserContributedProjects,
    currentUser: currentUser,
    displayImage: displayImage,
    displayCover: displayCover,
    fetchUser: fetchUser
};

export default userVM;
