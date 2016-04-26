import m from 'mithril';
import _ from 'underscore';
import h from 'h';
import projectCard from 'project-card'

const projectRow = {
    view (ctrl, args) {
        const collection = args.collection,
            title = args.title || collection.title,
            ref = args.ref,
            wrapper = args.wrapper || '.w-section.section.u-marginbottom-40';

        if (collection.loader() || collection.collection().length > 0) {
            return m(wrapper, [
                m('.w-container', [
                    (!_.isUndefined(collection.title) || !_.isUndefined(collection.hash)) ? m('.w-row.u-marginbottom-30', [
                        m('.w-col.w-col-10.w-col-small-6.w-col-tiny-6', [
                            m('.fontsize-large.lineheight-looser', title)
                        ]),
                        m('.w-col.w-col-2.w-col-small-6.w-col-tiny-6', [
                            m(`a.btn.btn-small.btn-terciary[href="/pt/explore?ref=${ref}#${collection.hash}"]`, 'Ver todos')
                        ])
                    ]) : '',
                    collection.loader() ? h.loader() : m('.w-row', _.map(collection.collection(), (project) => {
                        return m.component(projectCard, {
                            project: project,
                            ref: ref
                        });
                    }))
                ])
            ]);
        } else {
            return m('div');
        }
    }
}

export default projectRow;
