import m from 'mithril';
import h from '../h';
import adminItem from './admin-item';

const adminList = {
    oninit: function(vnode) {
        const list = vnode.attrs.vm.list;

        if (!list.collection().length && list.firstPage) {
            list.firstPage(vnode.attrs.filterVM ? vnode.attrs.filterVM.parameters() : null).then(null, (serverError) => {
                vnode.attrs.vm.error(serverError.message);
            });
        }
    },
    view: function({attrs}) {
        const list = attrs.vm.list,
            error = attrs.vm.error,
            label = attrs.label || '',
            itemComponent = attrs.itemComponent || adminItem;

        return m('.w-section.section', [
            m('.w-container',
                error() ?
                m('.card.card-error.u-radius.fontweight-bold', error()) : [
                    m('.w-row.u-marginbottom-20', [
                        m('.w-col.w-col-12', [
                            m('.fontsize-base',
                                list.isLoading() ?
                              `Carregando ${label.toLowerCase()}...` : [
                                  m('.w-row', [
                                      m('.w-col.w-col-2', [
                                          m('.fontweight-semibold', list.total()),
                                          ` ${label.toLowerCase()} encontrados`
                                      ]),
                                      (attrs.vm && attrs.vm.hasInputAction ? m('.w-col-10.w-col', attrs.vm.inputActions()) : '')
                                  ])
                              ]
                            )
                        ])
                    ]),
                    m('#admin-contributions-list.w-container', [
                        list.collection().map(item => m(itemComponent, {
                            listItem: attrs.listItem,
                            listDetail: attrs.listDetail,
                            listWrapper: attrs.vm,
                            item,
                            key: item.id
                        })),
                        m('.w-section.section', [
                            m('.w-container', [
                                m('.w-row', [
                                    m('.w-col.w-col-2.w-col-push-5', [
                                        list.isLoading() ?
                                        h.loader() :
                                        m('button#load-more.btn.btn-medium.btn-terciary', {
                                            onclick: list.nextPage
                                        }, 'Carregar mais'),
                                    ])
                                ])
                            ])
                        ])
                    ])
                ]
            )
        ]);
    }
};

export default adminList;
