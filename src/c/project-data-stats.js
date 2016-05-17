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
    view(ctrl,args) {
        const project = args.project(),
              progress = project.progress.toFixed(2),
              statusTextObj = h.projectStateTextClass(project.state),
              remainingTextObj = h.translatedTime(project.remaining_time),
              elapsedTextObj = h.translatedTime(project.elapsed_time);

        return m('.w-row.u-marginbottom-40', [
            m('.w-col.w-col-3.u-text-center-small-only', [
                m('.fontsize-small.fontweight-semibold.u-marginbottom-20', [
                    m('span.fontcolor-secondary', 'Status: '),
                    m('span', {class: statusTextObj.cssClass} ,statusTextObj.text)
                ])
            ]),
            m('.w-col.w-col-9', [
                m('.w-row.u-text-center', [
                    m('.w-col.w-col-3.w-col-small-6.w-col-tiny-6', [
                        m('.fontweight-semibold.fontsize-large.lineheight-tight', `${progress}%`),
                        m('.fontcolor-secondary.lineheight-tighter.fontsize-small.u-marginbottom-10', 'financiado')
                    ]),
                    m('.w-col.w-col-3.w-col-small-6.w-col-tiny-6', [
                        m('.fontweight-semibold.fontsize-large.lineheight-tight', `R$ ${h.formatNumber(project.pledged, 2)}`),
                        m('.fontcolor-secondary.lineheight-tighter.fontsize-small.u-marginbottom-10', 'levantados')
                    ]),
                    m('.w-col.w-col-3.w-col-small-6.w-col-tiny-6', [
                        m('.fontweight-semibold.fontsize-large.lineheight-tight', project.total_contributions),
                        m('.fontcolor-secondary.lineheight-tighter.fontsize-small', 'apoios')
                    ]),
                    m('.w-col.w-col-3.w-col-small-6.w-col-tiny-6', [
                        (_.isNull(project.expires_at) ? [
                            m('.fontweight-semibold.fontsize-large.lineheight-tight', `${elapsedTextObj.total} ${elapsedTextObj.unit}`),
                            m('.fontcolor-secondary.lineheight-tighter.fontsize-small', 'iniciado há')
                        ] : [
                            m('.fontweight-semibold.fontsize-large.lineheight-tight', `${remainingTextObj.total}`),
                            m('.fontcolor-secondary.lineheight-tighter.fontsize-small', `${remainingTextObj.unit} ${(remainingTextObj.total > 0 ? 'restantes' : 'restante')}`)
                        ])
                    ])
                ])
            ])
        ]);
    }
};

export default projectDataStats;
