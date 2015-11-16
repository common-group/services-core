window.c.ProjectContributions = ((m, models, h, _) => {
    return {
        controller: (args) => {
            const listVM = m.postgrest.paginationVM(models.projectContribution),
                filterVM = m.postgrest.filtersVM({
                    project_id: 'eq',
                    waiting_payment: 'eq'
                }),
                toggleWaiting = (waiting = false) => {
                    return () => {
                        filterVM.waiting_payment(waiting);
                        listVM.firstPage(filterVM.parameters());
                    };
                };

            filterVM.project_id(args.project.id).waiting_payment(false);

            if (!listVM.collection().length) {
                listVM.firstPage(filterVM.parameters());
            }

            return {
                listVM: listVM,
                filterVM: filterVM,
                toggleWaiting: toggleWaiting
            };
        },
        view: (ctrl, args) => {
            const list = ctrl.listVM;
            return m('#project_contributions.content.w-col.w-col-12', [
                (args.project.is_owner_or_admin ?
                    m('.w-row.u-marginbottom-20', [
                        m('.w-col.w-col-1', [
                            m('input[checked="checked"][id="contribution_state_available_to_count"][name="waiting_payment"][type="radio"][value="available_to_count"]', {
                                onclick: ctrl.toggleWaiting()
                            })
                        ]),
                        m('.w-col.w-col-5', [
                            m('label[for="contribution_state_available_to_count"]', 'Confirmados')
                        ]),
                        m('.w-col.w-col-1', [
                            m('input[id="contribution_state_waiting_confirmation"][type="radio"][name="waiting_payment"][value="waiting_confirmation"]', {
                                onclick: ctrl.toggleWaiting(true)
                            })
                        ]),
                        m('.w-col.w-col-5', [
                            m('label[for="contribution_state_waiting_confirmation"]', 'Pendentes')
                        ])
                    ]) : ''),
                m('.project-contributions', _.map(list.collection(), (contribution) => {
                    return m('.w-clearfix', [
                        m('.w-row.u-marginbottom-20', [
                            m('.w-col.w-col-1', [
                                m('a[href="/users/' + contribution.user_id + '"]', [
                                    m('.thumb.u-left.u-round[style="background-image: url(' + (!_.isEmpty(contribution.profile_img_thumbnail) ? contribution.profile_img_thumbnail : '/assets/catarse_bootstrap/user.jpg') + '); background-size: contain;"]')
                                ])
                            ]),
                            m('.w-col.w-col-11', [
                                m('.fontsize-base.fontweight-semibold', [
                                    m('a.link-hidden-dark[href="/users/' + contribution.user_id + '"]', contribution.user_name), (contribution.is_owner_or_admin ?
                                        m('.fontsize-smaller', [
                                            'R$ ' + h.formatNumber(contribution.value, 2, 3), (contribution.anonymous ? [m.trust('&nbsp;-&nbsp;'), m('strong', 'Apoiador anônimo')] : '')
                                        ]) : ''),
                                    m('.fontsize-smaller', h.momentify(contribution.created_at, 'DD/MM/YYYY, HH:mm') + 'h'),
                                    m('.fontsize-smaller', (contribution.total_contributed_projects > 1 ? 'Apoiou este e mais outros ' + contribution.total_contributed_projects + ' projetos' : 'Apoiou somente este projeto até agora'))
                                ])
                            ])
                        ]),
                        m('.divider.u-marginbottom-20')
                    ]);
                })),
                m('.w-row', [
                    m('.w-col.w-col-2.w-col-push-5', [!list.isLoading() ?
                        (list.isLastPage() ? '' : m('button#load-more.btn.btn-medium.btn-terciary', {
                            onclick: list.nextPage
                        }, 'Carregar mais')) :
                        h.loader(),
                    ])
                ])
            ]);
        }
    };
}(window.m, window.c.models, window.c.h, window._));
