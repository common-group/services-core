window.c.FilterButton = ((m, c) => {
    return {
        view: (ctrl, args) => {
            const filter = args.filter;
            return m('.w-col.w-col-2.w-col-small-6.w-col-tiny-6', [
                m(`a.w-inline-block.btn-category.filters${filter.length > 13 ? '.double-line' : ''}[href='#${args.href}']`, [
                    m('div', [
                        filter.title
                    ])
                ])
            ]);
        }
    };
}(window.m, window.c));
