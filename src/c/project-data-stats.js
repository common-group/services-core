/**
 * window.c.ProjectDataStats component
 * render a row with project stats info like:
 * state / total_contributions / total_pledged / elapsed | remaning time
 *
 * Example:
 * m.component(c.ProjectDataStats, {project: project})
 **/
import m from 'mithril';
import _ from 'underscore';
import h from '../h';

const projectDataStats = {
    view(ctrl, args) {
        const project = args.project(),
            visitorsTotal = args.visitorsTotal(),
            statusTextObj = h.projectStateTextClass(project.state, project.has_cancelation_request),
            remainingTextObj = h.translatedTime(project.remaining_time),
            elapsedTextObj = h.translatedTime(project.elapsed_time);


        return m('', [
            m('.w-row.u-marginbottom-60.u-margintop-30.u-text-center', [
                m('.w-col.w-col-2'),
                m('.w-col.w-col-4', [
                    m('.fontsize-large', [
                        m('span.fontcolor-secondary', 'Status: '),
                        m('span', { class: statusTextObj.cssClass }, statusTextObj.text)
                    ])
                ]),
                m('.w-col.w-col-4', [
                    m('.fontsize-large.fontweight-semibold', [
                        m('span.fa.fa-clock-o'),
                        (_.isNull(project.expires_at) ?
                            ` Iniciado há ${elapsedTextObj.total} ${elapsedTextObj.unit}`
                            :
                            ` ${remainingTextObj.total} ${remainingTextObj.unit} ${(remainingTextObj.total > 1 ? 'restantes' : 'restante')}`
                        )
                    ])
                ]),
                m('.w-col.w-col-2')
            ]),
            m('.card.medium.u-marginbottom-60.u-radius.u-text-center', { style: { 'white-space': 'nowrap' } }, [
                m('.w-row', [
                    m('.w-col.w-col-6', [
                        m('.w-row.u-marginbottom-30.u-margintop-30', [
                            m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4', [
                                m('.fontsize-larger.fontweight-semibold', `${visitorsTotal}`),
                                'Visitantes'
                            ]),
                            m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4', [
                                m('.bg-triangle-funnel.fontcolor-secondary.fontsize-base', `${h.formatNumber((project.total_contributors / visitorsTotal * 100 || 0), 2)}%`)
                            ]),
                            m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4', [
                                m('.fontsize-larger.fontweight-semibold', `${project.total_contributors}`),
                                'Apoiadores'
                            ])
                        ])
                    ]),
                    m('.w-col.w-col-6', [
                        m('.w-row.u-marginbottom-30.u-margintop-30', [
                            m('.w-col.w-col-9.w-col-small-6.w-col-tiny-6', [
                                m('.fontsize-larger.fontweight-semibold', `R$ ${h.formatNumber(project.pledged, 2)}`),
                                'Arrecadados'
                            ]),
                            m('.w-col.w-col-3.w-col-small-6.w-col-tiny-6', [
                                m('.fontsize-larger.fontweight-semibold', `${h.formatNumber(project.progress, 2)}%`),
                                'da Meta'
                            ])
                        ])
                    ])
                ]),
                m('.fontcolor-secondary.fontsize-smallest.u-margintop-20', [
                    'Os dados podem levar até 24 horas para serem atualizados.',
                    m('a.alt-link', { href: 'https://suporte.catarse.me/hc/pt-br/articles/115002214463-projeto-ONLINE#visitante', target: '_blank' }, ' Saiba mais'),
                    '.'
                ])
            ])
        ]);
    }
};

export default projectDataStats;
