import m from 'mithril';
import models from '../models';
import postgrest from 'mithril-postgrest';
import _ from 'underscore';
import h from '../h';
import contributionVM from '../vms/contribution-vm';
import inlineError from './inline-error';
import userContributedBox from './user-contributed-box';

const userPrivateContributed = {
    controller(args) {
        const user_id = args.userId,
              online = postgrest.paginationVM(models.project),
              onlinePages = postgrest.paginationVM(models.userContribution),
              successfulPages = postgrest.paginationVM(models.userContribution),
              failedPages = postgrest.paginationVM(models.userContribution),
              error = m.prop(false),
              loader = m.prop(true),
              contextVM = postgrest.filtersVM({
                  user_id: 'eq',
                  state: 'in',
                  project_state: 'in'
              });

        models.userContribution.pageSize(9);
        contextVM.user_id(user_id).order({
            created_at: 'desc'
        }).state(['refunded', 'pending_refund', 'paid', 'refused', 'pending']);

        contextVM.project_state(['online']);
        onlinePages.firstPage(contextVM.parameters()).then(() => {
            loader(false);
        });

        contextVM.project_state(['successful']);
        successfulPages.firstPage(contextVM.parameters()).then(() => {
            loader(false);
        });

        contextVM.project_state(['failed']);
        failedPages.firstPage(contextVM.parameters()).then(() => {
            loader(false);
        });

        return {
            onlinePages: onlinePages,
            successfulPages: successfulPages,
            failedPages: failedPages,
            error: error,
            loader: loader
        };
    },
    view(ctrl, args) {
        let online_collection = ctrl.onlinePages.collection(),
            successful_collection = ctrl.successfulPages.collection(),
            failed_collection = ctrl.failedPages.collection();
        return m('.content[id=\'private-contributed-tab\']', ctrl.loader() ? h.loader() :
                  [
                    m.component(userContributedBox, {title: 'Projetos em andamento', collection: online_collection, pagination: ctrl.onlinePages}),
                    m.component(userContributedBox, {title: 'Projetos bem-sucedidos', collection: successful_collection, pagination: ctrl.successfulPages}),
                    m.component(userContributedBox, {title: 'Projetos não-financiados', collection: failed_collection, pagination: ctrl.failedPages}),

                ]
              );
    }
};

export default userPrivateContributed;
