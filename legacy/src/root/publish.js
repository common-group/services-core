import m from 'mithril';
import prop from 'mithril/stream';
import _ from 'underscore';
import moment from 'moment';
import { catarse } from '../api';
import models from '../models';
import h from '../h';
import projectDashboardMenu from '../c/project-dashboard-menu';
import publishVM from '../vms/publish-vm';

const I18nScope = _.partial(h.i18nScope, 'projects.publish');

const publish = {
    oninit: function(vnode) {
        const filtersVM = catarse.filtersVM({
                project_id: 'eq'
            }),
            projectAccount = prop([]),
            projectDetails = prop([]),
            loader = catarse.loaderWithToken;

        filtersVM.project_id(vnode.attrs.root.getAttribute('data-id'));

        const l = loader(models.projectDetail.getRowOptions(filtersVM.parameters())),
            accountL = loader(models.projectAccount.getRowOptions(filtersVM.parameters()));
        l.load().then(projectDetails);
        accountL.load().then(projectAccount);

        const expiresAt = () => {
            const project = _.first(projectDetails());
            return moment().add(project.online_days, 'days');
        };

        const acceptedIndex = prop(0);

        return {
            l,
            accountL,
            acceptedIndex,
            expiresAt,
            filtersVM,
            projectAccount,
            projectDetails
        };
    },
    view: function({state, attrs}) {
        const project = _.first(ctrl.projectDetails()),
            acceptedIndex = ctrl.acceptedIndex,
            account = _.first(ctrl.projectAccount());

        const terms = project.mode === 'flex' ? publishVM.flexTerms(project) :
          project.mode === 'aon' ? publishVM.aonTerms(project, ctrl.expiresAt()) :
                                   publishVM.subTerms(project);

        return [project && account ? [
            (project.is_owner_or_admin ? m(projectDashboardMenu, {
                project: prop(project),
                hidePublish: true
            }) : ''),
            m(`.w-section.section-product.${project.mode}`),
            m('.w-section.section', [
                m('.w-container', [
                    m('.w-row', [
                        m('.w-col.w-col-3'),
                        m('.w-col.w-col-6', [
                            m('.u-text-center', [
                                m('img.u-marginbottom-20[src=\'/assets/catarse_bootstrap/launch-icon.png\'][width=\'94\']'),
                                m('.fontsize-large.fontweight-semibold.u-marginbottom-20', 'Pronto para lançar sua campanha?'),
                                m('.fontsize-base.u-marginbottom-30', 'Preparamos uma lista com informações importantes para você checar antes de colocar seu projeto no ar!')
                            ])
                        ]),
                        m('.w-col.w-col-3')
                    ])
                ])
            ]),
            m('.divider'),
            m('.w-section.section-one-column.bg-gray.section.before-footer', [
                m('.w-container', [
                    m('.card.medium.u-marginbottom-60.card-terciary', [
                        m('.w-row', [
                            m('.w-col.w-col-6.w-clearfix', [
                                m(`img.card-project-thumb.u-right[src=${project.large_image}]`)
                            ]),
                            m('.w-col.w-col-6', [
                                m('.u-marginbottom-30.fontsize-base', [
                                    m('div', [m('span.fontweight-semibold', 'Título: '), project.name]),
                                    m('div', [m('span.fontweight-semibold', 'Link: '), `www.catarse.me/${project.permalink}`]),
                                    m('div', [m('span.fontweight-semibold', 'Modalidade de financiamento: '), window.I18n.t(project.mode, I18nScope())]),
                                    (project.mode !== 'sub' ?
                                        m('div', [m('span.fontweight-semibold', 'Meta de arrecadação: '), `R$ ${h.formatNumber(project.goal, 2, 3)}`]) :
                                        ''),
                                    (project.online_days !== null) ? m('div', [m('span.fontweight-semibold', `Prazo: ${project.online_days} ${(project.online_days > 1) ? 'dias' : 'dia'}`)]) : '',
                                    m('div', [m('span.fontweight-semibold', 'Responsável: '), account.owner_name]),
                                    m('div', [m('span.fontweight-semibold', 'CPF/CNPJ: '), account.owner_document])
                                ])
                            ])
                        ]),
                        m('.u-text-center', [
                            m('.w-row', [
                                m('.w-col.w-col-1'),
                                m('.w-col.w-col-10', [
                                    m('.divider.u-marginbottom-10'),
                                    m('.fontsize-small.fontcolor-secondary', 'Os dados acima não podem ser alterados após o projeto entrar no ar. Se você precisa fazer mudanças, navegue na barra lateral e volte aqui quando estiver tudo pronto!')
                                ]),
                                m('.w-col.w-col-1')
                            ])
                        ])
                    ]),
                    m('.card.medium.u-radius.u-marginbottom-60', [
                        m('.u-text-center.u-marginbottom-60', [
                            m('.fontsize-large.fontweight-semibold', 'Relembre nossas regras'),
                            m('.w-row', [
                                m('.w-col.w-col-2'),
                                m('.w-col.w-col-8', [
                                    m('.fontsize-small', ['Antes de publicar, clique nos círculos abaixo e confirme que você está ciente de como funciona o Catarse. Qualquer dúvida, ', m('a.alt-link[href="http://suporte.catarse.me/hc/pt-br/requests/new"][target="_blank"]', 'entre em contato'), '!'])
                                ]),
                                m('.w-col.w-col-2')
                            ])
                        ]),

                        _.map(terms, (term, index) => m(`.u-marginbottom-30.fontsize-base${(index <= acceptedIndex()) ? '' : '.w-hidden.publish-rules'}`, [
                            m('.w-row', [
                                m('.w-col.w-col-1.u-text-center', [
                                    m('div', [
                                        m((index + 1 > acceptedIndex()) ? 'a.w-inline-block.checkbox-big' : 'a.w-inline-block.checkbox-big.checkbox--selected.fa.fa-check.fa-lg', {
                                            onclick: () => {
                                                if (index >= acceptedIndex()) {
                                                    acceptedIndex(acceptedIndex() + 1);
                                                }
                                            }
                                        })
                                    ])
                                ]),
                                term
                            ])
                        ]))

                    ]),
                    (acceptedIndex() >= terms.length ?
                    m('.w-row.publish-btn-section', [
                        m('.w-col.w-col-4'),
                        m('.w-col.w-col-4', [
                            m(`a.btn.btn-large.u-marginbottom-20[href=/${project.mode === 'flex' ? 'flexible_projects' : 'projects'}/${project.project_id}/push_to_online]`, 'Publicar agora!'),
                            m('.u-text-center.fontsize-smaller', [
                                'Ao publicar o seu projeto, você está aceitando os ',
                                m('a.alt-link[href=\'/terms-of-use\'][target=\'_blank\']', 'Termos de Uso'),
                                ' e ',
                                m('a.alt-link[href=\'/privacy-policy\'][target=\'_blank\']', 'Politica de Privacidade')
                            ])
                        ]),
                        m('.w-col.w-col-4')
                    ]) : '')
                ])
            ])
        ] : h.loader()];
    }
};

export default publish;
