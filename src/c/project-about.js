window.c.ProjectAbout = ((m, c, h) => {
    return {
        view: (ctrl, args) => {
            const project = args.project;
            let fundingPeriod = () => {
                return project.is_published ? m('.funding-period', [
                    m('.fontsize-small.fontweight-semibold.u-text-center-small-only', 'Período de campanha'),
                    m('.fontsize-small.u-text-center-small-only', [
                        h.momentify(project.online_date), ' - ', h.momentify(project.zone_expires_at), ' (' + project.online_days + ' dias) '
                    ])
                ]) : '';
            };

            return m('#project-about', [
                m('.project-about.w-col.w-col-8', {
                    config: h.UIHelper()
                }, [
                    m('p.fontsize-base', [
                        m('strong', 'O projeto'),
                    ]),
                    m('.fontsize-base[itemprop="about"]', m.trust(project.about_html)),
                    m('p.fontsize-large.fontweight-semibold', 'Orçamento'),
                    m('p.fontsize-base', m.trust(project.budget))
                ]),
                m('.w-col.w-col-4.w-hidden-small.w-hidden-tiny', args.rewardDetails() ? [
                    m('.w-hidden-small.w-hidden-tiny.fontsize-base.fontweight-semibold.u-marginbottom-30', 'Recompensas'),
                    m.component(c.ProjectRewardList, {
                        project: project,
                        rewardDetails: args.rewardDetails
                    }), fundingPeriod()
                ] : [
                    m('.w-hidden-small.w-hidden-tiny.fontsize-base.fontweight-semibold.u-marginbottom-30', 'Sugestões de apoio'),
                    m.component(c.ProjectSuggestedContributions, {project: project}),
                    fundingPeriod()
                ])
            ]);
        }
    };
}(window.m, window.c, window.c.h));
