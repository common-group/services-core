import m from 'mithril';
import prop from 'mithril/stream';
import h from '../h';

export const InputSelectSearchClearable = {
    oninit(vnode) {

        const openSearchControl = h.RedrawStream(false);

        vnode.state = {
            openSearchControl
        }
    },

    view({ state, attrs }) {

        const onSearch = attrs.onSearch;
        const onSelect = attrs.onSelect;
        const selectedItem = attrs.selectedItem || prop('Brasil');
        const foundItems = attrs.foundItems || prop([]);
        const itemToString = attrs.itemToString;
        const openSearchControl = state.openSearchControl;
        const openSearchControlDisplayStyle = openSearchControl() ? 'block' : 'none';

        return m('div.explore-filter-wrapper', [
            m('div.explore-span-filter', { 'style': { 'border-color': 'rgba(0, 0, 0, 0.11)' } }, [
                m('div.explore-span-filter-name', [
                    m('div.explore-mobile-label', 'LOCAL'),
                    m('div.inline-block', selectedItem())
                ]),
                m('.inline-block.fa.fa-angle-down[aria-hidden="true"]', {
                    onclick: () => openSearchControl(true)
                })
            ]),
            m('div.explore-filter-select.big.w-clearfix', { 'style': { 'display': openSearchControlDisplayStyle } }, [
                m('a.modal-close.fa.fa-close.fa-lg.w-hidden-main.w-hidden-medium.w-inline-block[href="#"]', {
                    onclick: () => openSearchControl(false)
                }),
                m('div.w-form', [
                    m('form.position-relative', [
                        m('a.btn-search.w-inline-block[href="#"]',
                            m('img.header-lupa[src="https://uploads-ssl.webflow.com/57ba58b4846cc19e60acdd5b/57ba58b4846cc19e60acdda7_lupa.png"][alt=""]')
                        ),
                        m('input.text-field.positive.city-search.w-input[type="text"][autofocus][maxlength="256"][placeholder="Pesquise por cidade ou estado"]', {
                            oninput: (/** @type {Event} */ event) => onSearch(event.target.value),
                            onkeyup: (/** @type {Event} */ event) => onSearch(event.target.value),
                        }),
                        m('div.table-outer', { 'style': { 'display': 'block' } }, [
                            foundItems().map(item => {
                                return m('div.table-row.fontsize-smallest.fontcolor-secondary',
                                    m('a.fontsize-smallest.link-hidden-light[href="#"]', {
                                        onclick: () => onSelect(item)
                                    }, itemToString(item))
                                );
                            })
                        ])
                    ]),
                ])
            ])
        ]);
    }
}