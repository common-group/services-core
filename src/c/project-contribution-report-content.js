import m from 'mithril';
import _ from 'underscore';
import h from '../h';
import popNotification from './pop-notification';
import projectContributionReportContentCard from './project-contribution-report-content-card';
import projectsContributionReportVM from '../vms/projects-contribution-report-vm';

const projectContributionReportContent = {
    controller(args) {
        const showSelectedMenu = h.toggleProp(false, true),
            selectedAny = m.prop(false),
            showSuccess = m.prop(false),
            selectedContributions = m.prop([]),
            selectAll = () => {
                projectsContributionReportVM.getAllContributions(args.filterVM).then((data) => {
                    const exceptReceived = _.filter(data, contrib => contrib.delivery_status !== 'received');
                    selectedContributions().push(..._.pluck(exceptReceived, 'id'));
                    selectedAny(!_.isEmpty(exceptReceived));
                });
            },
            unselectAll = () => {
                selectedContributions([]);
                selectedAny(false);
            },
            updateStatus = (status) => {
                const data = {
                    contributions: selectedContributions(),
                    delivery_status: status
                };
                projectsContributionReportVM.updateStatus(data).then(() => {
                    showSuccess(true);
                    showSelectedMenu.toggle();
                    // update status so we don't have to reload the page
                    _.map(_.filter(args.list.collection(), contrib => _.contains(selectedContributions(), contrib.id)),
                          item => item.delivery_status = status);
                }).catch((err) => {
                    m.redraw();
                });
                return false;
            };

        return {
            showSuccess,
            selectAll,
            unselectAll,
            updateStatus,
            showSelectedMenu,
            selectedAny,
            selectedContributions
        };
    },
    view(ctrl, args) {
        const list = args.list;
        const isFailed = args.project().state === 'failed';

        return m('.w-section.bg-gray.before-footer.section', [

            (ctrl.showSuccess() ? m.component(popNotification, {
                message: 'As informações foram atualizadas'
            }) : ''),
            m('.w-container', [
                m('.u-marginbottom-40',
                    m('.w-row', [
                        m('.u-text-center-small-only.w-col.w-col-2',
                            m('.fontsize-base.u-marginbottom-10', [
                                m('span.fontweight-semibold',
                                    (list.isLoading() ? '' : list.total())
                                ),
                                ' apoios'
                            ])
                        ),
                        m('.w-col.w-col-6', isFailed ? '' : [
                            (!ctrl.selectedAny() ?
                                m('button.btn.btn-inline.btn-small.btn-terciary.u-marginright-20.w-button', {
                                    onclick: ctrl.selectAll
                                },
                                    'Selecionar todos'
                                ) :
                                m('button.btn.btn-inline.btn-small.btn-terciary.u-marginright-20.w-button', {
                                    onclick: ctrl.unselectAll
                                },
                                    'Desmarcar todos'
                                )
                            ),
                            (ctrl.selectedAny() ?
                                m('.w-inline-block', [
                                    m('button.btn.btn-inline.btn-small.btn-terciary.w-button', {
                                        onclick: ctrl.showSelectedMenu.toggle
                                    }, [
                                        'Marcar ',
                                        m('span.w-hidden-tiny',
                                            'entrega'
                                        ),
                                        ' como'
                                    ]),
                                    (ctrl.showSelectedMenu() ?
                                        m('.card.dropdown-list.dropdown-list-medium.u-radius.zindex-10[id=\'transfer\']', [
                                            m('a.dropdown-link.fontsize-smaller[href=\'#\']', {
                                                onclick: () => ctrl.updateStatus('delivered')
                                            },
                                                'Enviada'
                                            ),
                                            m('a.dropdown-link.fontsize-smaller[href=\'#\']', {
                                                onclick: () => ctrl.updateStatus('error')
                                            },
                                                'Erro no envio'
                                            )
                                        ]) : '')
                                ]) : '')
                        ]),
                        m('.w-clearfix.w-col.w-col-4',
                            m(`a.alt-link.fontsize-small.lineheight-looser.u-right[href="/projects/${args.project().project_id}/download_reports"]`, [
                                m('span.fa.fa-download',
                                    ''
                                ),
                                ' Baixar relatórios'
                            ])
                        )
                    ])
                ),

                // TODO: ordering filter template
                // m(".w-col.w-col-3.w-col-small-6.w-col-tiny-6", [
                // m(".w-form", [
                // m("form[data-name='Email Form 5'][id='email-form-5'][name='email-form-5']", [
                // m(".fontsize-smallest.fontcolor-secondary", "Ordenar por:"),
                // m("select.w-select.text-field.positive.fontsize-smallest[id='field-9'][name='field-9']", [
                // m("option[value='']", "Data (recentes para antigos)"),
                // m("option[value='']", "Data (antigos para recentes)"),
                // m("option[value='']", "Valor (maior para menor)"),
                // m("option[value='First']", "Valor (menor para maior)")
                // ])
                // ])
                // ])
                // ])*/
                // ]),
                _.map(list.collection(), (item) => {
                    const contribution = m.prop(item);
                    return m.component(projectContributionReportContentCard, {
                        project: args.project,
                        contribution,
                        selectedContributions: ctrl.selectedContributions,
                        selectedAny: ctrl.selectedAny
                    });
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
