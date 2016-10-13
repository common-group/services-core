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
              contextVM = postgrest.filtersVM({
                project_id: 'in',
                state: 'in'
              });

        userVM.getUserCreatedProjects(user_id, null).then((data) => {
            createdProjects(data);
            contextVM.state(['online', 'waiting_funds', 'successful', 'failed']).
              project_id(_.map(createdProjects(), (project) => {return project.project_id})).order({
                online_date: 'desc'
            });

            models.project.pageSize(9);
            pages.firstPage(contextVM.parameters());
        });

        return {
            projects: pages
        };
    },
    view(ctrl, args) {
      let projects_collection = ctrl.projects.collection();

      return m('.content[id=\'created-tab\']',
                [
                  (!_.isEmpty(projects_collection) ? _.map(projects_collection, (project) => {
                        return m.component(projectCard, {
                            project: project,
                            ref: 'user_contributed',
                            showFriends: false
                        });
                  }) :
                    m(".w-container", 
                        m(".u-margintop-30.u-text-center.w-row",
                            [
                                m(".w-col.w-col-3"),
                                m(".w-col.w-col-6",
                                    [
                                        m(".fontsize-large.u-marginbottom-30",
                                                "O que você está esperando para tirar seu projeto do papel aqui no Catarse?"),
                                        m(".w-row",
                                            [
                                                m(".w-col.w-col-3"),
                                                m(".w-col.w-col-6", 
                                                    m("a.btn.btn-large[href='/start']", 
                                                        "Comece agora!"
                                                    )
                                                ),
                                                m(".w-col.w-col-3")
                                            ]
                                        )
                                    ]
                                ),
                                m(".w-col.w-col-3")
                            ]
                        )
                    )
                  ),

                  (!_.isEmpty(projects_collection) ? 
                  m('.w-row.u-marginbottom-40.u-margintop-30', [
                      m('.w-col.w-col-2.w-col-push-5', [!ctrl.projects.isLoading() ?
                                                        ctrl.projects.isLastPage() ? '' : m('button#load-more.btn.btn-medium.btn-terciary', {
                                                            onclick: ctrl.projects.nextPage
                                                        }, 'Carregar mais') : h.loader(),
                                                       ])
                  ]) : '')
                ]
              )
              ;
    }
};

export default userCreated;
