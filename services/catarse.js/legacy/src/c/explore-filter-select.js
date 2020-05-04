import m from 'mithril';
import prop from 'mithril/stream';
import h from '../h';
import _ from 'underscore';

/**
 * @typedef ExploreFilterValue
 * @property {string} label
 * @property {string} value
 */

/**
 * @typedef ExploreFilterAttrs
 * @property {ExploreFilterValue[]} values
 * @property {() => boolean} isSelected
 * @property {(item : ExploreFilterValue) => void} onSelect
 * @property {string} mobileLabel
 * @property {() => string} itemToString
 * @property {number} splitNumberColumns
 */

 /**
  * @typedef ExploreFilterState
  * @property {{(newData:any) => any, toggle() : any}} showFilterSelect
  */

 /**
  * @typedef ExploreFilterViewParams
  * @property {ExploreFilterAttrs} attrs
  * @property {ExploreFilterState} state
  */

const ColumnSplit = (values, start, finish, onSelect, isSelected) => _.map(values.slice(start, finish), item =>
    m(`a.explore-filter-link[href="javascript:void(0);"]`, {
        onclick: () => onSelect(item),
        class: isSelected(item) ? 'selected' : ''
    }, item.label)
);

export const ExploreFilterSelect = {

    oninit(vnode) {
        const showFilterSelect = h.RedrawToggleStream(false, true);

        vnode.state = {
            showFilterSelect,
        };
    },

    /**
     * @param {ExploreFilterViewParams} viewParams
     * @returns {m.Vnode}
     */
    view({state, attrs}) {

        const isSelected = attrs.isSelected;
        const itemToString = attrs.itemToString;
        const onSelect = attrs.onSelect;
        const values = attrs.values;
        const mobileLabel = attrs.mobileLabel;
        const splitNumberColumns = attrs.splitNumberColumns || 1;
        const showFilterSelect = state.showFilterSelect;
        
        return m('.explore-filter-wrapper', [
            m('.explore-span-filter', {
                onclick: () => showFilterSelect.toggle()
            }, [
                m('div.explore-span-filter-name', [
                    m('div.explore-mobile-label', mobileLabel),
                    m('div.inline-block', itemToString()),
                ]),
                m('.inline-block.fa.fa-angle-down[aria-hidden="true"]', {
                    onclick: (/** @type {Event} */ event) => {
                        event.stopPropagation();
                        showFilterSelect.toggle();
                    }
                })
            ]),
            (
                showFilterSelect() && 
                    (
                        splitNumberColumns > 1 ?
                            (
                                m('.explore-filter-select.big',
                                    m('.explore-filer-select-row', [
                                        _.range(0, splitNumberColumns).map(columnIndex => {
                                            return m('.explore-filter-select-col', [
                                                ColumnSplit(
                                                    values, 
                                                    Math.floor(values.length / splitNumberColumns) * columnIndex,
                                                    Math.floor(values.length / splitNumberColumns) * (columnIndex + 1),
                                                    onSelect,
                                                    isSelected
                                                )
                                            ]);
                                        }),
                                        m('a.modal-close.fa.fa-close.fa-lg.w-hidden-main.w-hidden-medium.w-inline-block', {
                                            onclick: () => state.categoryToggle(false)
                                        })
                                    ])
                                )
                            )
                        :
                            (
                                m('.explore-filter-select', [
                                    values.map(item => {
                                        return m(`a.explore-filter-link[href="javascript:void(0);"]`, {
                                            onclick: () => {
                                                showFilterSelect(false);
                                                onSelect(item);
                                            },
                                            class: isSelected(item) ? 'selected' : ''
                                        }, item.label);
                                    }),
                                    m('a.modal-close.fa.fa-close.fa-lg.w-hidden-main.w-hidden-medium.w-inline-block', {
                                        onclick: () => showFilterSelect(false)
                                    })
                                ])
                            )
                    )
            )
        ]);
    }
};