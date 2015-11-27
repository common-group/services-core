window.c.contribution.ProjectsExplore = ((m, c) => {
    return {

        controller: () => {
            let vm = {
                categoryCollection: m.prop([]),
                projectCollection: m.prop([]),
                categoryName: m.prop(),
                categoryFollowers: m.prop(),

                loadCategory: (category) => {
                    let byCategoryId = m.postgrest.filtersVM({category_id: 'eq'});
                    vm.categoryName(category.name);
                    vm.categoryFollowers(category.followers);
                    byCategoryId.category_id(category.id);
                    project.getPage(byCategoryId.parameters()).then(vm.projectCollection);
                    vm.toggleCategories();
                },

                loadProjects: (filter) => {
                    vm.categoryName(filter.title);
                    vm.categoryFollowers(null);
                    if (filter.filter === nearMe){
                        project.getPageWithToken(nearMe.parameters()).then(vm.projectCollection);
                    } else {
                        project.getPage(filter.filter.parameters()).then(vm.projectCollection);
                    }
                    vm.toggleCategories();
                },

                toggleCategories: () => {
                    document.getElementById('categories').classList.toggle('closed');
                }
            };

            let
                project = c.models.project,
                category = c.models.category,
                categories = m.postgrest.filtersVM({}),

                nearMe = m.postgrest.filtersVM({near_me: 'eq', state: 'eq'}),
                expiring = m.postgrest.filtersVM({expires_at: 'lte', state: 'eq'}),
                recents = m.postgrest.filtersVM({online_date: 'gte', state: 'eq'}),
                recommended = m.postgrest.filtersVM({recommended: 'eq', state: 'eq'}),
                online = m.postgrest.filtersVM({state: 'eq'}),
                successful = m.postgrest.filtersVM({state: 'eq'});

            expiring.expires_at(moment().add(14, 'days').format('YYYY-MM-DD'));
            recents.online_date(moment().subtract(5, 'days').format('YYYY-MM-DD'));
            recents.state('online');
            expiring.state('online');
            online.state('online');
            successful.state('successful');
            recommended.recommended('true').state('online');
            nearMe.near_me('true');

            project.pageSize(9);
            category.getPage(categories.parameters()).then(vm.categoryCollection);

            let filters = [
                {
                    title: 'Recomendados',
                    filter: recommended
                },
                {
                    title: 'No ar',
                    filter: online
                },
                {
                    title: 'Reta final',
                    filter: expiring
                },
                {
                    title: 'Bem-sucedidos',
                    filter: successful
                },
                {
                    title: 'Recentes',
                    filter: recents
                },
                {
                    title: 'Próximos a mim',
                    filter: nearMe
                }
            ];

            return {
                categories: vm.categoryCollection,
                projects: vm.projectCollection,
                categoryName: vm.categoryName,
                categoryFollowers: vm.categoryFollowers,
                filters: filters,
                vm: vm
            };
        },

        view: (ctrl) => {
            return [
                m('.w-section.hero-search', [
                    m('.w-container.u-marginbottom-10', [
                        m('.u-text-center.u-marginbottom-40', [
                            m('.a.link-hidden-white.fontweight-light.fontsize-larger[href=\'#\']',{onclick: ctrl.vm.toggleCategories}, ['Explore projetos incríveis ',m('span.fa.fa-angle-down', '')])
                        ]),

                        m('#categories.category-slider',[
                            m('.w-row', [
                                _.map(ctrl.categories(), (category) => {
                                    return m('.w-col.w-col-2.w-col-small-6.w-col-tiny-6', [
                                        m(`a.w-inline-block.btn-category${category.name.length > 13 ? '.double-line' : ''}[href='#by_category_id/#${category.id}']`,
                                          {onclick: ctrl.vm.loadCategory.bind(ctrl, category)}, [
                                              m('div', [
                                                  category.name,
                                                  m('span.badge.explore', category.online_projects)
                                              ])
                                          ])
                                    ]);
                                })
                            ]),

                            m('.w-row.u-marginbottom-30', [
                                _.map(ctrl.filters, (filter) => {
                                    return m('.w-col.w-col-2.w-col-small-6.w-col-tiny-6', [
                                        m(`a.w-inline-block.btn-category.filters${filter.length > 13 ? '.double-line' : ''}[href='#recommended']`, {onclick: ctrl.vm.loadProjects.bind(ctrl, filter)}, [
                                            m('div', [
                                                filter.title
                                            ])
                                        ])
                                    ]);
                                })

                            ])
                        ]),
                    ])
                ]),

                m('.w-section', [
                    m('.w-container', [
                        m('.w-row', [
                            m('.w-col.w-col-6.w-col-tiny-6', [
                                m('.fontsize-larger', ctrl.categoryName())
                            ]),

                            (ctrl.categoryFollowers()) ? m('.w-col.w-col-6.w-col-tiny-6', [
                                m('.w-row', [
                                    m('.w-col.w-col-9.w-col-tiny-6.w-clearfix', [
                                        m('.following.fontsize-small.fontcolor-secondary.u-right', `${ctrl.categoryFollowers()} seguidores`)
                                    ]),
                                    m('.w-col.w-col-3.w-col-tiny-6', [
                                        m('a.btn.btn-small[href=\'#\']', 'Seguindo ')
                                    ])
                                ])
                            ]) : ''

                        ])
                    ])
                ]),

                m('.w-section.section', [
                    m('.w-container', [
                        m('.w-row', [
                            m('.w-row', _.map(ctrl.projects(), (project) => {
                                return m.component(c.ProjectCard, {project: project});
                            }))
                        ])
                    ])
                ]),

                m('.w-section.section.loadmore', [
                    m('.w-container', [
                        m('.w-row', [
                            m('.w-col.w-col-5'),
                            m('.w-col.w-col-2', [
                                m('a.btn.btn-medium.btn-terciary[href=\'#loadMore\']', {onclick: ctrl.projects.nextPage}, 'Carregar mais')
                            ]),
                            m('.w-col.w-col-5')
                        ])
                    ])
                ])];
        }
    };
}(window.m, window.c));
