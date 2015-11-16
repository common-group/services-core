window.c.ProjectHeader = (function(m, c) {
    return {
        view: function(ctrl, args) {
            var project = args.project;
            return m('#project-header', [
                m('.w-section.section-product.' + project.mode),
                m('.w-section.page-header.u-text-center', [
                    m('.w-container', [
                        m('h1.fontsize-larger.fontweight-semibold.project-name[itemprop="name"]', project.name),
                        m('h2.fontsize-base.lineheight-looser[itemprop="author"]', [
                            'por ',
                            project.user.name
                        ])
                    ])
                ]),
                m('.w-section.project-main', [
                    m('.w-container', [
                        m('.w-row.project-main', [
                            m('.w-col.w-col-8.project-highlight', m.component(c.ProjectHighlight, {
                                project: project
                            })),
                            m('.w-col.w-col-4', m.component(c.ProjectSidebar, {
                                project: project,
                                userDetails: args.userDetails
                            }))
                        ])
                    ])
                ])
            ]);
        }
    };
}(window.m, window.c));
