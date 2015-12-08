window.c.ProjectAbout = ((m, c, h) => {
    return {
        view: (ctrl, args) => {
            const project = args.project,
                onlineDays = () => {
                    let diff = moment(project.zone_online_date).diff(moment(project.zone_expires_at)),
                        duration = moment.duration(diff);

                    return -Math.ceil(duration.asDays());
                };
            let fundingPeriod = () => {
                return (project.is_published && h.existy(project.zone_expires_at)) ? m('.funding-period', [
                    m('.fontsize-small.fontweight-semibold.u-text-center-small-only', 'Período de campanha'),
                    m('.fontsize-small.u-text-center-small-only', `${h.momentify(project.zone_online_date)} - ${h.momentify(project.zone_expires_at)} (${onlineDays()} dias)`)
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
                    m('p.fontsize-base.fontweight-semibold', 'Orçamento'),
                    m('p.fontsize-base', m.trust(project.budget))
                ]),
                m('.w-col.w-col-4.w-hidden-small.w-hidden-tiny', !_.isEmpty(args.rewardDetails()) ? [
                    m('.fontsize-base.fontweight-semibold.u-marginbottom-30', 'Recompensas'),
                    m.component(c.ProjectRewardList, {
                        project: project,
                        rewardDetails: args.rewardDetails
                    }), fundingPeriod()
                ] : [
                    m('.fontsize-base.fontweight-semibold.u-marginbottom-30', 'Sugestões de apoio'),
                    m.component(c.ProjectSuggestedContributions, {project: project}),
                    fundingPeriod()
                ])
            ]);
        }
    };
}(window.m, window.c, window.c.h));
