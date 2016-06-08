import m from 'mithril';
import _ from 'underscore';
import postgrest from 'mithril-postgrest';
import h from '../h';
import models from '../models';

const userVM = (user_id) => {
    const idVM = h.idVM,
          userDetails = m.prop([]),
          createdVM = postgrest.filtersVM({
              user_id: 'eq'
          });

    idVM.id(user_id);

    createdVM.user_id(user_id).order({project_id: 'desc'});
    models.projectDetail.pageSize(3);

    const lUser = postgrest.loaderWithToken(models.userDetail.getRowOptions(idVM.parameters()));

    const lUserCreated = postgrest.loaderWithToken(models.projectDetail.getPageOptions(createdVM.parameters()));

    const lUserContributed = {};

    return {
        lUser: lUser,
        lUserCreated: lUserCreated,
        lUserContributed: lUserContributed
    };
};

export default userVM;
