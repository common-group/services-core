import m from 'mithril';
import _ from 'underscore';
import h from 'h';
import projectHighlight from 'project-highlight';
import projectSidebar from 'project-sidebar';

const projectHeader = {
    view (ctrl, args) {
        let project = args.project;

        if (_.isUndefined(project())){
            project = m.prop({});
        }

        return m('#project-header', [
            m('.w-section.section-product.' + project().mode),
            m('.w-section.page-header.u-text-center', [
                m('.w-container', [
                    m('h1.fontsize-larger.fontweight-semibold.project-name[itemprop="name"]', h.selfOrEmpty(project().name)),
                    m('h2.fontsize-base.lineheight-looser[itemprop="author"]', (project().user) ? [
                        'por ',
                        project().user.name
                    ] : '')
                ])
            ]),
            m('.w-section.project-main', [
                m('.w-container', [
                    m('.w-row.project-main', [
                        m('.w-col.w-col-8.project-highlight', m.component(projectHighlight, {
                            project: project
                        })),
                        m('.w-col.w-col-4', m.component(projectSidebar, {
                            project: project,
                            userDetails: args.userDetails
                        }))
                    ])
                ])
            ])
        ]);
    }
}

export default projectHeader;
