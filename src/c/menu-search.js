import m from 'mithril';

const menuSearch = {
    view(ctrl, args) {
        return m('span#menu-search', [
            m('.w-form.w-hidden-small.w-hidden-tiny.header-search[id=\'discover-form-wrapper\']',
                  [
                      m('form.discover-form[accept-charset=\'UTF-8\'][action=\'/pt/explore\'][id=\'search-form\'][method=\'get\']',
                          [
                              m('div', {style: {'display': 'none'}},
                                  m('input[name=\'utf8\'][type=\'hidden\'][value=\'✓\']')
                              ),
                              m('input.w-input.text-field.negative.prefix.search-input[autocomplete=\'off\'][id=\'pg_search\'][name=\'pg_search\'][placeholder=\'Busque projetos\'][type=\'text\']')
                          ]
                      ),
                      m('.search-pre-result.w-hidden[data-searchpath=\'/pt/auto_complete_projects\']',
                          [
                              m('.result',
                                  m('.u-text-center',
                                      m('img[alt=\'Loader\'][src=\'/assets/catarse_bootstrap/loader-b642f2f0212454026a5c7c40620427c1.gif\']')
                                  )
                              ),
                              m('a.btn.btn-small.btn-terciary.see-more-projects[href=\'javascript:void(0);\']',
                                  ' ver todos'
                              )
                          ]
                      )
                  ]
              ),
              m('a.w-inline-block.w-hidden-small.w-hidden-tiny.btn.btn-dark.btn-attached.postfix[href=\'#\'][id=\'pg_search_submit\']',
                  m('img.header-lupa[alt=\'Lupa\'][data-pin-nopin=\'true\'][src=\'/assets/catarse_bootstrap/lupa-a2e6f4b98c43604325ed4c786d4be5a4.png\']')
              )
        ]);
    }
};

export default menuSearch;
