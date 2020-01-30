import m from 'mithril';
import h from '../../h';
import models from '../../models';
import { catarse } from '../../api';
import './explore-light-box.css';

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
                name: 'Populares',
                keyName: 'all',
            },
            {
                name: 'Recentes',
                keyName: 'recent'
            },
            {
                name: 'Reta final',
                keyName: 'expiring'
            },
            {
                name: 'Apoiados por amigos',
                keyName: 'contributed_by_friends'
            }
        ];

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
                        return m(`a.explore-lightbox-filter-link[href="/${window.I18n.locale}/explore?${urlBaseParams}&filter=${filter.keyName}"]`, {
                            onclick: (event) => {
                                m.route.set(`/${window.I18n.locale}/explore?${urlBaseParams}&filter=${filter.keyName}#`);
                                window.location.hash = `#${filter.keyName}`;
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
                        return m(`a.explore-lightbox-filter-link[href="/${window.I18n.locale}/explore?${urlBaseParams}#by_category_id/${category.id}"]`, {
                            onclick: (event) => {
                                m.route.set(`/${window.I18n.locale}/explore?${urlBaseParams}&filter=all`)
                                window.location.hash = `#by_category_id${encodeURIComponent('/')}${category.id}`;
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