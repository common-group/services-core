import m from 'mithril';
import _ from 'underscore';
import h from '../h';
import projectContributionReportContentCard from './project-contribution-report-content-card';

const projectContributionReportContent = {
    view(ctrl, args) {
        const list = args.list;
        return m('.w-section.bg-gray.before-footer.section', [
            m('.w-container', [
                m('.w-row.u-marginbottom-20', [
                    m('.w-col.w-col-9.w-col-small-6.w-col-tiny-6', [
                        m('.fontsize-base', [
                            m('span.fontweight-semibold', (list.isLoading() ? '' : list.total())),
                            ' apoios'
                        ]),
                        //m(".fontsize-large.fontweight-semibold", "R$ 12.000,00")
                    ]),
                    /*
                     TODO: ordering filter template
                    m(".w-col.w-col-3.w-col-small-6.w-col-tiny-6", [
                        m(".w-form", [
                            m("form[data-name='Email Form 5'][id='email-form-5'][name='email-form-5']", [
                                m(".fontsize-smallest.fontcolor-secondary", "Ordenar por:"),
                                m("select.w-select.text-field.positive.fontsize-smallest[id='field-9'][name='field-9']", [
                                    m("option[value='']", "Data (recentes para antigos)"),
                                    m("option[value='']", "Data (antigos para recentes)"),
                                    m("option[value='']", "Valor (maior para menor)"),
                                    m("option[value='First']", "Valor (menor para maior)")
                                ])
                            ])
                        ])
                    ])*/
                ]),
                _.map(list.collection(), (item) => {
                    const contribution = m.prop(item);
                    return m.component(projectContributionReportContentCard, {contribution: contribution});
                })
            ]),
            m('.w-section.section.bg-gray', [
                m('.w-container', [
                    m('.w-row.u-marginbottom-60', [
                        m('.w-col.w-col-2.w-col-push-5', [
                            (!list.isLoading() ?
                             (list.isLastPage() ? '' : m('button#load-more.btn.btn-medium.btn-terciary', {
                                 onclick: list.nextPage
                             }, 'Carregar mais')) : h.loader())
                        ])
                    ])

                ])
            ])

        ]);
    }
};

export default projectContributionReportContent;
