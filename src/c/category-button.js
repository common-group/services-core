/**
 * window.c.CategoryButton component
 * Return a link with a btn-category class.
 * It uses a category parameter.
 *
 * Example:
 * m.component(c.CategoryButton, {
 *     category: {
 *         id: 1,
 *         name: 'Video',
 *         online_projects: 1
 *     }
 * })
 */
import m from 'mithril';
import _ from 'underscore';
import I18n from 'i18n-js';

const categoryButton = {
    view(ctrl, args) {
        const category = args.category,
            externalLinkCategories = I18n.translations[I18n.currentLocale()].projects.index.explore_categories,
            link = _.isUndefined(externalLinkCategories[category.id])
                    ? `#by_category_id/${category.id}`
                    : externalLinkCategories[category.id];

        return m('.w-col.w-col-2.w-col-small-6.w-col-tiny-6', [
            m(`a.w-inline-block.btn-category[href="${link}"]`, [
                m('div', [
                    category.name,
                    m('span.badge.explore', category.online_projects)
                ])
            ])
        ]);
    }
};

export default categoryButton;
