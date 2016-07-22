/**
 * window.c.loadMoreBtn component
 * Button to paginate collection
 *
 * Example of use:
 * view: () => {
 *   ...
 *   m.component(c.loadMoreBtn, {collection: collection})
 *   ...
 * }
 */
import m from 'mithril';
import _ from 'underscore';
import h from '../h';

const loadMoreBtn = {
    view(ctrl, args) {
        const collection = args.collection;
        return m('.w-col.w-col-2', [
              (!collection.isLoading() ?
               (collection.isLastPage() ? '' : m('button#load-more.btn.btn-medium.btn-terciary', {
                   onclick: collection.nextPage
               }, 'Carregar mais')) : h.loader())
          ]);
    }
};

export default loadMoreBtn;
