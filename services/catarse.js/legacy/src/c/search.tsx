/**
 * window.c.Search component
 * Returns a search input
 *
 * Example:
 * m.component(c.Search, {action: '/search', method: 'GET'})
 */

import m from 'mithril';

type SearchAttrs = {
    action : string
    method : string
}

const search = {
    view: function({ attrs } : m.Vnode<SearchAttrs>) {
        const action = attrs.action || `/${window.I18n.locale}/explore?ref=ctrse_explore_pgsearch&filter=all`
        const method = attrs.method || 'GET'

        return (
            <div id='#search' class='w-hidden-main w-hidden-medium w-row'>
                <div class='w-col w-col-11'>
                    <div class='header-search'>
                        <div class='w-row'>
                            <div class='w-col w-col-10 w-col-small-10 w-col-tiny-10'>
                                <div class='w-form'>
                                    <form id='search-form-id' action={action} method={method}>
                                        <input id='pg_search_inside' type='text' name='pg_search' placeholder='Busque projetos' class='w-input text-field negative prefix'/>
                                        <input type='hidden' name='filter' value='all' />
                                    </form>
                                </div>
                            </div>

                            <div class='w-col w-col-2 w-col-small-2 w-col-tiny-2'>
                                <input value='' type='submit' alt='Lupa' form='search-form-id' class='btn btn-attached postfix btn-dark w-inline-block' style='background-repeat: no-repeat; background-position: center; background-image: url(/assets/catarse_bootstrap/lupa.png)'/>
                                {/* <img src='/assets/catarse_bootstrap/lupa.png' class='header-lupa' alt='Lupa' data-pin-nopin={true} /> */}
                            </div>
                        </div>
                    </div>
                </div>

                <div class='w-col w-col-1'></div>
            </div>
        )
    }
};

export default search;
