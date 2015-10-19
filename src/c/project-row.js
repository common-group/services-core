window.c.ProjectRow = ((m) => {
    return {

        view: (ctrl, args) => {
            const collection = args.collection,
                ref = args.ref;
            return collection.collection().length > 0 ? m('.w-section.section.u-marginbottom-40', [
                m('.w-container', [
                    m('.w-row.u-marginbottom-30', [
                        m('.w-col.w-col-10.w-col-small-6.w-col-tiny-6', [
                            m('.fontsize-large.lineheight-looser', collection.title)
                        ]),
                        m('.w-col.w-col-2.w-col-small-6.w-col-tiny-6', [
                            m(`a.btn.btn-small.btn-terciary[href="/pt/explore?ref=${ref}#${collection.hash}"]`, 'Ver todos')
                        ])
                    ]),
                    m('.w-row', _.map(collection.collection(), (project) => {
                        return m.component(c.ProjectCard, {
                            project: project,
                            ref: ref
                        });
                    }))
                ])
            ]) : m('');
        }
    };
}(window.m));
