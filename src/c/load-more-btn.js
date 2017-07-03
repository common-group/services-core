/**
 * window.c.loadMoreBtn component
 * Button to paginate collection
 *
 * Example of use:
 * view: () => {
 *   ...
 *   m.component(c.loadMoreBtn, {collection: collection, cssClass: 'class'})
 *   ...
 * }
 */
import m from 'mithril';
import h from '../h';

const loadMoreBtn = {
    view(ctrl, args) {
        const collection = args.collection,
            cssClass = args.cssClass;
        return m(`.w-col.w-col-4${cssClass}`, [
              (!collection.isLoading() ?
               (collection.isLastPage() ? '' : m('button#load-more.btn.btn-medium.btn-terciary.w-button', {
                   onclick: collection.nextPage
               }, 'Carregar mais')) : h.loader())
        ]);
    }
};

export default loadMoreBtn;
