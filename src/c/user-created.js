import m from 'mithril';
import models from '../models';
import postgrest from 'mithril-postgrest';
import _ from 'underscore';
import h from '../h';
import userVM from '../vms/user-vm';
import projectCard from './project-card';

const userCreated = {
    controller(args) {
        const createdProjects = m.prop(),
              user_id = args.userId,
              pages = postgrest.paginationVM(models.project),
              loader = m.prop(true),
              contextVM = postgrest.filtersVM({
                  project_user_id: 'eq',
                  state: 'in'
              });

        contextVM.state(['online', 'waiting_funds', 'successful', 'failed']).
          project_user_id(user_id).order({
            online_date: 'desc'
        });

        models.project.pageSize(9);
        pages.firstPage(contextVM.parameters()).then(()=>{
            loader(false);
        });

        return {
            projects: pages,
            loader: loader
        };
    },
    view(ctrl, args) {
        let projects_collection = ctrl.projects.collection();

        return m('.content[id=\'created-tab\']',
                  (!ctrl.loader() ?
                  [
                  (!_.isEmpty(projects_collection) ? _.map(projects_collection, (project) => {
                      return m.component(projectCard, {
                            project: project,
                            ref: 'user_contributed',
                            showFriends: false
                        });
                  }) :
                    m('.w-container',
                        m('.u-margintop-30.u-text-center.w-row',
                            [
                                m('.w-col.w-col-3'),
                                m('.w-col.w-col-6',
                                    [
                                        m('.fontsize-large.u-marginbottom-30',
                                                'O que você está esperando para tirar seu projeto do papel aqui no Catarse?'),
                                        m('.w-row',
                                            [
                                                m('.w-col.w-col-3'),
                                                m('.w-col.w-col-6',
                                                    m('a.btn.btn-large[href=\'/start\']',
                                                        'Comece agora!'
                                                    )
                                                ),
                                                m('.w-col.w-col-3')
                                            ]
                                        )
                                    ]
                                ),
                                m('.w-col.w-col-3')
                            ]
                        )
                    )
                  ),

                  (!_.isEmpty(projects_collection) ?
                  m('.w-row.u-marginbottom-40.u-margintop-30', [
                      m('.w-col.w-col-2.w-col-push-5', [
                                                        ctrl.projects.isLastPage() ? '' : m('button#load-more.btn.btn-medium.btn-terciary', {
                                                            onclick: ctrl.projects.nextPage
                                                        }, 'Carregar mais')
                                                       ])
                  ]) : '')
                ] : h.loader())
              )
              ;
    }
};

export default userCreated;
