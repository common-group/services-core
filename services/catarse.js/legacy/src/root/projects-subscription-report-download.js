import m from 'mithril';
import prop from 'mithril/stream';
import _ from 'underscore';
import projectDashboardMenu from '../c/project-dashboard-menu';
import {
    catarse
} from '../api';
import projectsContributionReportVM from '../vms/projects-contribution-report-vm';
import h from '../h';
import models from '../models';
import { projectSubscriptionReportDownloadEntry } from '../c/project-subscription-report-download-entry';
import { listProjectReportExports, Report } from '../vms/project-report-exports-vm';

const projectSubscriptionReportDownload = {
    oninit: function (vnode) {
        const catarseVM = projectsContributionReportVM;
        const reports = prop([]);
        const loading = prop(true);
        const project = prop([{}]);
        catarseVM.project_id(vnode.attrs.project_id);
        const lProject = catarse.loaderWithToken(models.projectDetail.getPageOptions({
            project_id: `eq.${catarseVM.project_id()}`
        }));

        lProject.load().then((data) => {
            project(data);
        });

        listProjectReportExports(vnode.attrs.project_id)
            .then((r) => {
                reports(r);
                loading(false);
                h.redraw();
            })
            .catch((e) => {
                loading(false);
                h.redraw();
            });

        vnode.state = {
            project,
            loading,
            reports
        };
    },
    view: function ({ state, attrs }) {

        /** @type {Report[]} */
        const reports = state.reports();
        /** @type {boolean} */
        const loading = state.loading();


        return m('div', [
            m('div.dashboard-header.u-text-center',
                m('div.w-container',
                    m('div.w-row', [
                        m('div.w-col.w-col-2'),
                        m('div.w-col.w-col-8',
                            m('div.fontweight-semibold.fontsize-larger.lineheight-looser', 'Relatórios exportados')
                        ),
                        m('div.w-col.w-col-2')
                    ])
                )
            ),
            m('div.section.min-height-70',
                m('div.w-container',
                    m('div.w-row', [
                        m('div.w-col.w-col-2'),
                        m('div.w-col.w-col-8', [
                            m('.card.u-radius.u-marginbottom-20.card-terciary', [
                                m('div.fontsize-small.fontweight-semibold.u-marginbottom-20', [
                                    m('span.fa.fa-download'),
                                    ' Baixar relatórios'
                                ]),
                                m('div.card.u-radius', [
                                    m('strong', 'Atenção: '),
                                    'Ao realizar o download desses dados, você se compromete a armazená-los em local seguro e respeitar o direitos dos usuários conforme o que está previsto nos Termos de Uso e na política de privacidade do Catarse.'
                                ])
                            ]),

                            (
                                loading ?
                                    h.loader()
                                :
                                    reports.map(report => 
                                        m(projectSubscriptionReportDownloadEntry, report)
                                    )
                            )
                        ]), 
                        m("div.w-col.w-col-2")
                    ])
                )
            )
        ]);

    }
};

export default projectSubscriptionReportDownload;
