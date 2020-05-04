import m from 'mithril';
import _ from 'underscore';
/**
 * @typedef PerFilter
 * @property {m.Vnode} icon
 * @property {string} label
 */

/**
 * @typedef ExploreProjectsFoundCounterAttrs
 * @property {number} total
 * @property {PerFilter[]} perFilter
 */

/**
 * @typedef ExploreProjectsFoundCounterViewParams
 * @property {ExploreProjectsFoundCounterAttrs} attrs
 */

export const ExploreProjectsFoundCounter = {

    /**
     * @param {ExploreProjectsFoundCounterViewParams} vnode
     * @returns {m.Vnode}
     */
    view({attrs}) {
        const total = attrs.total;
        const perFilter = attrs.perFilter;

        return m('div',
            m('.w-container',
                m('.w-row', [
                    m('.w-col.w-col-9.w-col-tiny-9.w-col-small-9', [
                        m('.fontsize-large',
                            `${total} projetos encontrados`
                        ),
                        (
                            perFilter.length ?
                                m('div.fontsize-small.fontcolor-secondary.fontweight-semibold', 
                                    _.compact(
                                        _.flatten([
                                            perFilter.map((filter, index) => {
                                                return [
                                                    filter.icon,
                                                    filter.label,
                                                    index < perFilter.length - 1 && '|'
                                                ];
                                            })
                                        ])
                                    )
                                )
                            :
                                null
                        )
                    ]),
                    m('.w-col.w-col-3.w-col-tiny-3.w-col-small-3')
                ])
            )
        );
    }
}