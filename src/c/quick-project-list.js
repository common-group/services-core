import m from 'mithril';
import projectVM from '../vms/project-vm';

const quickProjectList = {
    view(ctrl, args) {
        return m('.quickProjectList', _.map(args.projects(), (project, idx) => m('li.u-marginbottom-10', {
            key: idx
        }, m('.w-row',
            [
                m('.w-col.w-col-3',
                                m(`img.thumb.small.u-radius[alt='Project thumb 01'][src='${project.thumb_image || project.video_cover_image}']`)
                            ),
                m('.w-col.w-col-9',
                                m(`a.alt-link.fontsize-smaller[href='/${project.permalink}?ref=ctrse_search_quick']`, {
                                    onclick: projectVM.routeToProject(project, args.ref)
                                },
                                    `${project.name}`
                                )
                            )
            ]
                    )
                )), m('li.u-margintop-20',
                  m('.w-row',
                      [
                          m('.w-col.w-col-6',
                              m(`a.btn.btn-terciary[href=${args.loadMoreHref}?ref=ctrse_search_quick]`,
                                  'Ver todos'
                              )
                          ),
                          m('.w-col.w-col-6')
                      ]
                  )
              )
        );
    }
};

export default quickProjectList;
