import m from 'mithril';
import h from '../../h';
import models from '../../models';
import { catarse } from '../../api';
import './explore-light-box.css';
import userVM from '../../vms/user-vm';

export class ExploreLightBox {
    oninit(vnode) {

    }

    view({state, attrs}) {
        const onClose = attrs.onClose;
        const categories = attrs.categories;
        const closePreventRedirect = (/** @type {Event} */ event) => {
            event.preventDefault();
            onClose();
        }

        const filters = [
            {
                name: 'Projetos que amamos',
                keyName: 'projects_we_love',
            },
            {
                name: 'Populares',
                keyName: 'all',
            },
            userVM.isLoggedIn ? {
                name: 'Projetos Salvos',
                keyName: 'saved_projects'
            } : null,
            userVM.isLoggedIn ? {
                name: 'Apoiados por amigos',
                keyName: 'contributed_by_friends'
            } : null,
            {
                name: 'Recentes',
                keyName: 'recent'
            },
            {
                name: 'Reta final',
                keyName: 'expiring'
            }
        ].filter(f => f !== null);

        const urlBaseParams = 'ref=ctrse_header&utm_source=catarse&utm_medium=ctrse_header&utm_campaign=testeAB_explorelightbox';

        return m('div.explore-lightbox', 
            m('div.explore-lightbox-container.w-clearfix', [
                m('a.modal-close-container.fa.fa-2x.fa-close.w-inline-block[href="#"]', { onclick: closePreventRedirect }),
                m('div.u-marginbottom-30', [
                    m('div.u-margintop-30', 
                        m('div.fontsize-base.fontcolor-terciary', 
                            'Fitro'
                        )
                    ),
                    filters.map(filter => {

                        const navigateUrl = `/${window.I18n.locale}/explore?${urlBaseParams}&filter=${filter.keyName}`;

                        return m(`a.explore-lightbox-filter-link[href="${navigateUrl}"]`, {
                            onclick: (event) => {
                                m.route.set(navigateUrl);
                                event.preventDefault();
                                onClose();
                            }
                        }, filter.name);
                    })
                ]),
                m('div.u-marginbottom-30', [
                    m('div.u-margintop-30', 
                        m('div.fontsize-base.fontcolor-terciary', 'Categorias')
                    ),
                    categories().map(category => {

                        const navigateUrl = `/${window.I18n.locale}/explore?${urlBaseParams}&category_id=${category.id}&filter=all`;

                        return m(`a.explore-lightbox-filter-link[href="${navigateUrl}"]`, {
                            onclick: (event) => {
                                m.route.set(navigateUrl);
                                event.preventDefault();
                                onClose();
                            }
                        }, category.name);
                    })
                ])
            ])
        );
    }
}