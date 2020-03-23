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



export function ExploreFilterSelect(vnode) {

    return {
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
            const onClickExploreFilter = (/** @type {Event} */ event) => {
                showFilterSelect.toggle();
                event.stopPropagation();
            };
            
            return m('.explore-filter-wrapper', [
                m('.explore-span-filter', {
                    onclick: onClickExploreFilter
                }, [
                    m('div.explore-span-filter-name', [
                        m('div.explore-mobile-label', mobileLabel),
                        m('div.inline-block', itemToString()),
                    ]),
                    m('.inline-block.fa.fa-angle-down[aria-hidden="true"]', {
                        onclick: onClickExploreFilter
                    })
                ]),
                (
                    showFilterSelect() && 
                        (
                            splitNumberColumns > 1 ?
                                m(ExploreFilterSelectionColumns, {
                                    isSelected,
                                    onSelect,
                                    values,
                                    splitNumberColumns,
                                    showFilterSelect,
                                })
                            :
                                m(ExploreFilterSelectionSingleColumn, {
                                    isSelected,
                                    onSelect,
                                    values,
                                    showFilterSelect,
                                })
                        )
                )
            ]);
        }
    }
};

const ExploreFilterSelectionColumns = {
        
    /**
     * @param {ExploreFilterViewParams} viewParams
     * @returns {m.Vnode}
     */
    view({attrs}) {
        const isSelected = attrs.isSelected;
        const onSelect = attrs.onSelect;
        const values = attrs.values;
        const splitNumberColumns = attrs.splitNumberColumns || 1;
        const showFilterSelect = attrs.showFilterSelect;
        const onSelectWithClose = (item) => {
            showFilterSelect(false);
            onSelect(item);                
        };

        return m('.explore-filter-select.big',
            m('.explore-filer-select-row', [
                _.range(0, splitNumberColumns).map(columnIndex => {
                    return m('.explore-filter-select-col', [
                        columnSplit(
                            values, 
                            Math.floor(values.length / splitNumberColumns) * columnIndex,
                            Math.floor(values.length / splitNumberColumns) * (columnIndex + 1),
                            onSelectWithClose,
                            isSelected
                        )
                    ]);
                }),
                m('a.modal-close.fa.fa-close.fa-lg.w-hidden-main.w-hidden-medium.w-inline-block', {
                    onclick: () => showFilterSelect(false)
                })
            ])
        );
    }
};

const ExploreFilterSelectionSingleColumn = {
    
    /**
     * @param {ExploreFilterViewParams} viewParams
     * @returns {m.Vnode}
     */
    view({attrs}) {
        const isSelected = attrs.isSelected;
        const onSelect = attrs.onSelect;
        const values = attrs.values;
        const showFilterSelect = attrs.showFilterSelect;

        return m('.explore-filter-select', [
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
        ]);
    }
};

function columnSplit(values, start, finish, onSelect, isSelected) {
    return values.slice(start, finish).map(item => {
        return m(`a.explore-filter-link[href="javascript:void(0);"]`, {
            onclick: () => onSelect(item),
            class: isSelected(item) ? 'selected' : ''
        }, item.label);
    });
}