window.c.CategoryButton = ((m, c) => {
    return {
        view: (ctrl, args) => {
            const category = args.category;
            return m('.w-col.w-col-2.w-col-small-6.w-col-tiny-6', [
                m(`a.w-inline-block.btn-category${category.name.length > 13 ? '.double-line' : ''}[href='#by_category_id/#${category.id}']`,
                  [
                      m('div', [
                          category.name,
                          m('span.badge.explore', category.online_projects)
                      ])
                  ])
            ]);
        }
    };
}(window.m, window.c));
