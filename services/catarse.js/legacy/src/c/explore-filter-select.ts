import m from 'mithril';
import prop from 'mithril/stream';
import h from '../h';
import _ from 'underscore';

/**
 * @typedef ExploreFilterValue
 * @property {string} label
 * @property {string} value
 */


type ExploreFilterAttrs = {
    values: any[];
    isSelected(item : any): boolean;
    onSelect(item : any): void;
    mobileLabel: string;
    itemToString(item : any): string;
    selectedItem(): any;
    splitNumberColumns?: number;
}

type ExploreFilterState = {
    showFilterSelect: {(newData?:any): any, toggle() : any}
}

type ExploreFilterViewParams = {
    attrs: ExploreFilterAttrs;
    state: ExploreFilterState;
}

export const ExploreFilterSelect : m.Component<ExploreFilterAttrs, ExploreFilterState> = {
    oninit(vnode) {
        const showFilterSelect = h.RedrawToggleStream(false, true);

        vnode.state = {
            showFilterSelect,
        };
    },
    
    view({state, attrs}) {
    
        const isSelected = attrs.isSelected;
        const itemToString = attrs.itemToString;
        const onSelect = attrs.onSelect;
        const selectedItem = attrs.selectedItem;
        const values = attrs.values;
        const mobileLabel = attrs.mobileLabel;
        const splitNumberColumns = attrs.splitNumberColumns || 1;
        const showFilterSelect = state.showFilterSelect;
        const onClickExploreFilter = (event : Event) => {
            showFilterSelect.toggle();
            event.stopPropagation();
        };
            
        return m('.explore-filter-wrapper', [
            m('.explore-span-filter', {
                onclick: onClickExploreFilter
            }, [
                m('div.explore-span-filter-name', [
                    m('div.explore-mobile-label', mobileLabel),
                    m('div.inline-block', itemToString(selectedItem())),
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
                                    itemToString,
                                })
                                :
                                m(ExploreFilterSelectionSingleColumn, {
                                    isSelected,
                                    onSelect,
                                    values,
                                    showFilterSelect,
                                    itemToString,
                                })
                        )
            )
        ]);
    }
};

type ExploreFilterSelectionColumnsViewParams = {
    showFilterSelect: {(newData?:any): any, toggle() : any};
    values: any[];
    isSelected: (item) => boolean;
    onSelect: (item : any) => void;
    itemToString: (item) => string;
    splitNumberColumns?: number;
}

const ExploreFilterSelectionColumns : m.Component<ExploreFilterSelectionColumnsViewParams> = {

    view({attrs}) {
        const isSelected = attrs.isSelected;
        const onSelect = attrs.onSelect;
        const itemToString = attrs.itemToString;
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
                            itemToString,
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

type ExploreFilterSingleColumnViewParams = {
    showFilterSelect: {(newData?:any): any, toggle() : any};
    values: any[];
    isSelected: (item) => boolean;
    onSelect: (item : any) => void;
    itemToString: (item) => string;
}

const ExploreFilterSelectionSingleColumn : m.Component<ExploreFilterSingleColumnViewParams> = {
    
    /**
     * @param {ExploreFilterViewParams} viewParams
     * @returns {m.Vnode}
     */
    view({attrs}) {
        const isSelected = attrs.isSelected;
        const onSelect = attrs.onSelect;
        const itemToString = attrs.itemToString;
        const values = attrs.values;
        const showFilterSelect = attrs.showFilterSelect;

        return m('.explore-filter-select', [
            values.map(item => {
                return m('a.explore-filter-link[href="javascript:void(0);"]', {
                    onclick: () => {
                        showFilterSelect(false);
                        onSelect(item);
                    },
                    class: isSelected(item) ? 'selected' : ''
                }, itemToString(item));
            }),
            m('a.modal-close.fa.fa-close.fa-lg.w-hidden-main.w-hidden-medium.w-inline-block', {
                onclick: () => showFilterSelect(false)
            })
        ]);
    }
};

function columnSplit(itemToString, values, start, finish, onSelect, isSelected) {
    return values.slice(start, finish).map(item => {
        return m('a.explore-filter-link[href="javascript:void(0);"]', {
            onclick: () => onSelect(item),
            class: isSelected(item) ? 'selected' : ''
        }, itemToString(item));
    });
}