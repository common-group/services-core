window.c.ProjectCard = ((m, h, models) => {
    return {
        view: (ctrl, args) => {
            const project = args.project,
                progress = project.progress.toFixed(2),
                remainingTextObj = h.translatedTime(project.remaining_time),
                link = '/' + project.permalink + (args.ref ? '?ref=' + args.ref : '');

            return m('.w-col.w-col-4', [
                m('.card-project.card.u-radius', [
                    m(`a.card-project-thumb[href="${link}"]`, {
                        style: {
                            'background-image': `url(${project.project_img})`,
                            'display': 'block'
                        }
                    }),
                    m('.card-project-description.alt', [
                        m('.fontweight-semibold.u-text-center-small-only.lineheight-tight.u-marginbottom-10.fontsize-base', [
                            m(`a.link-hidden[href="${link}"]`, project.project_name)
                        ]),
                        m('.w-hidden-small.w-hidden-tiny.fontsize-smallest.fontcolor-secondary.u-marginbottom-20', `por ${project.owner_name}`),
                        m('.w-hidden-small.w-hidden-tiny.fontcolor-secondary.fontsize-smaller', [
                            m(`a.link-hidden[href="${link}"]`, project.headline)
                        ])
                    ]),
                    m('.w-hidden-small.w-hidden-tiny.card-project-author.altt', [
                        m('.fontsize-smallest.fontcolor-secondary', [m('span.fa.fa-map-marker.fa-1', ' '), ` ${project.city_name}, ${project.state_acronym}`])
                    ]),
                    m(`.card-project-meter.${project.state}`, [
                        (project.state === 'successful') ?
                            m('div', 'Bem-sucedido') :
                        (project.state === 'failed') ?
                            m('div', 'Não-financiado') :
                        (project.state === 'waiting_funds') ?
                            m('div', 'Prazo encerrado') :
                        m('.meter', [
                            m('.meter-fill', {
                                style: {
                                    width: `${(progress > 100 ? 100 : progress)}%`
                                }
                            })
                        ])
                    ]),
                    m('.card-project-stats', [
                        m('.w-row', [
                            m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4', [
                                m('.fontsize-base.fontweight-semibold', `${Math.ceil(project.progress)}%`)
                            ]),
                            m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.u-text-center-small-only', [
                                m('.fontsize-smaller.fontweight-semibold', `R$ ${h.formatNumber(project.pledged)}`),
                                m('.fontsize-smallest.lineheight-tightest', 'Levantados')
                            ]),
                            m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.u-text-right', project.expires_at ? [
                                m('.fontsize-smaller.fontweight-semibold', `${remainingTextObj.total} ${remainingTextObj.unit}`),
                                m('.fontsize-smallest.lineheight-tightest', (remainingTextObj.total > 1) ? 'Restantes' : 'Restante')
                            ] : [
                                m('.fontsize-smallest.lineheight-tight', ['Prazo em',m('br'),'aberto'])
                            ])
                        ])
                    ])
                ])
            ]);
        }
    };
}(window.m, window.c.h, window._));
