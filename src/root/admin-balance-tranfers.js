import m from 'mithril';
import h from '../h';
import _ from 'underscore';
import balanceTransferListVM from '../vms/balance-transfer-list-vm';
import balanceTransferFilterVM from '../vms/balance-transfer-filter-vm';
import adminList from '../c/admin-list';
import adminFilter from '../c/admin-filter';
import filterMain from '../c/filter-main';
import filterDropdown from '../c/filter-dropdown';
import filterDateRange from '../c/filter-date-range';
import filterNumberRange from '../c/filter-number-range';
import modalBox from '../c/modal-box';
import adminBalanceTransferItem from '../c/admin-balance-transfer-item';
import adminBalanceTransferItemDetail from '../c/admin-balance-transfer-item-detail';

const adminBalanceTranfers = {
    controller(args) {
        const listVM = balanceTransferListVM,
              filterVM = balanceTransferFilterVM,
              error = m.prop(''),
              selectedAny = m.prop(false),
              filterBuilder = [
                  {
                      component: filterMain,
                      data: {
                          vm: filterVM.full_text_index,
                          placeholder: 'Busque pelo email, ids do usuario, ids de transferencia e eventos de saldo'
                      }
                  },
                  {
                      component: filterDropdown,
                      data: {
                          label: 'Status',
                          name: 'state',
                          vm: filterVM.state,
                          options: [{
                              value: '',
                              option: 'Qualquer um'
                          }, {
                              value: 'pending',
                              option: 'Pendente'
                          }, {
                              value: 'authorized',
                              option: 'Autorizado'
                          }, {
                              value: 'processing',
                              option: 'Processando'
                          }, {
                              value: 'transferred',
                              option: 'Concluido'
                          }, {
                              value: 'error',
                              option: 'Erro'
                          }, {
                              value: 'rejected',
                              option: 'Rejeitado'
                          }, {
                              value: 'gateway_error',
                              option: 'Erro no gateway'
                          }]
                      }
                  },
                  {
                      component: filterDateRange,
                      data: {
                          label: 'Data da solicitação',
                          first: filterVM.created_date.gte,
                          last: filterVM.created_date.lte
                      }

                  },
                  {
                      component: filterDateRange,
                      data: {
                          label: 'Data da confirmação',
                          first: filterVM.transferred_date.gte,
                          last: filterVM.transferred_date.lte
                      }

                  },
                  {
                      component: filterNumberRange,
                      data: {
                          label: 'Valores entre',
                          first: filterVM.amount.gte,
                          last: filterVM.amount.lte
                      }
                  }
              ],
              selectedItemsIDs = m.prop([]),
              displayApprovalModal = h.toggleProp(false, true),
              displayManualModal = h.toggleProp(false, true),
              displayRejectModal = h.toggleProp(false, true),
              selectAllLoading = m.prop(false),
              redrawProp = m.prop(false),
              actionMenuToggle = h.toggleProp(false, true),
              isSelected = (item_id) => {
                  return _.find(selectedItemsIDs(), (i) => {
                      return i.id == item_id;
                  });
              },
              selectItem = (item) => {
                  if (!_.find(selectedItemsIDs(), (i) => { return i.id == item.id; })) {
                      selectedItemsIDs().push(item);
                  }
                  selectedAny(true);
              },
              unSelectItem = (item) => {
                  let newIDs = _.reject(selectedItemsIDs(), (i) => {
                      return i.id == item.id;
                  });
                  selectedItemsIDs(newIDs);
                  if(_.isEmpty(newIDs)) {
                      selectedAny(false);
                  }
              },
              submit = () => {
                  error(false);
                  listVM.firstPage(filterVM.parameters()).then(null, (serverError) => {
                      error(serverError.message);
                  });

                  return false;
              },
              generateWrapperModal = (customAttrs) => {
                  const wrapper = {
                      view(ctrl, args) {
                          actionMenuToggle(false);
                          return m('', [
                              m('.modal-dialog-header', [
                                  m('.fontsize-large.u-text-center', args.modalTitle)
                              ]),
                              m('.modal-dialog-content', [
                                  m('.w-row.fontweight-semibold', [
                                      m('.w-col.w-col-6', 'Nome'),
                                      m('.w-col.w-col-3', 'Valor'),
                                      m('.w-col.w-col-3', 'Solicitado em'),
                                  ]),
                                  _.map(selectedItemsIDs(), (item, index) => {
                                      return m('.divider.fontsize-smallest.lineheight-looser', [
                                          m('.w-row', [
                                              m('.w-col.w-col-6', [
                                                  m('span', item.user_name)
                                              ]),
                                              m('.w-col.w-col-3', [
                                                  m('span', `R$ ${h.formatNumber(item.amount, 2, 3)}`)
                                              ]),
                                              m('.w-col.w-col-3', [
                                                  m('span', h.momentify(item.created_at))
                                              ]),
                                          ])
                                      ]);
                                  }),
                                  m('.w-row.fontweight-semibold.divider', [
                                      m('.w-col.w-col-6', 'Total'),
                                      m('.w-col.w-col-3', 
                                        `R$ ${h.formatNumber(_.reduce(selectedItemsIDs(), (t, i) => {
                                            return t + i.amount;
                                        }, 0), 2, 3)}`),
                                      m('.w-col.w-col-3'),
                                  ]),
                                  m('.w-row.u-margintop-40', [
                                      m('.w-col.w-col-1'),
                                      m('.w-col.w-col-5',
                                        m('a.btn.btn-medium.w-button', {
                                            onclick: args.onClickCallback
                                        }, args.ctaText)
                                       ),
                                      m('.w-col.w-col-5',
                                        m('a.btn.btn-medium.btn-terciary.w-button', {
                                            onclick: args.displayModal.toggle
                                        }, 'Voltar')
                                       ),
                                      m('.w-col.w-col-1')
                                  ])
                              ])
                          ]);
                      }
                  };

                  return [wrapper, customAttrs];
              },
              manualTransferSelectedIDs = () => {
                  m.request({
                      method: 'POST',
                      url: '/admin/balance_transfers/batch_manual',
                      data: {
                          transfer_ids: _.uniq(_.map(selectedItemsIDs(), (s) => {
                              return s.id;
                          }))
                      },
                      config: h.setCsrfToken
                  }).then((data) => {
                      selectedItemsIDs([]);
                      listVM.firstPage(filterVM.parameters());
                      displayManualModal(false);
                      m.redraw();
                  });
              },
              approveSelectedIDs = () => {
                  m.request({
                      method: 'POST',
                      url: '/admin/balance_transfers/batch_approve',
                      data: {
                          transfer_ids: _.uniq(_.map(selectedItemsIDs(), (s) => {
                              return s.id;
                          }))
                      },
                      config: h.setCsrfToken
                  }).then((data) => {
                      selectedItemsIDs([]);
                      listVM.firstPage(filterVM.parameters());
                      displayApprovalModal(false);
                      m.redraw();
                  });
              },
              rejectSelectedIDs = () => {
                  m.request({
                      method: 'POST',
                      url: '/admin/balance_transfers/batch_reject',
                      data: {
                          transfer_ids: _.uniq(_.map(selectedItemsIDs(), (s) => {
                              return s.id;
                          }))
                      },
                      config: h.setCsrfToken
                  }).then((data) => {
                      selectedItemsIDs([]);
                      displayRejectModal(false);
                      listVM.firstPage();
                      m.redraw();
                  });
              },
              unSelectAll = () => {
                  selectedItemsIDs([]);
                  selectedAny(false);
              },
              selectAll = () => {
                  selectAllLoading(true);
                  m.redraw();
                  filterVM.getAllBalanceTransfers(filterVM).then((data) => {
                      _.map(_.where(data, {state: 'pending'}), selectItem);
                      selectAllLoading(false);
                      m.redraw();
                  });
              },
              inputActions = () => {
                  return m('', [
                      m('button.btn.btn-inline.btn-small.btn-terciary.u-marginright-20.w-button', { onclick: selectAll }, (selectAllLoading() ? 'carregando...' : `Selecionar todos`)),
                      (selectedItemsIDs().length > 1 ? m('button.btn.btn-inline.btn-small.btn-terciary.u-marginright-20.w-button', { onclick: unSelectAll }, `Desmarcar todos (${selectedItemsIDs().length})`) : ''),
                      (selectedAny() ?
                       m('.w-inline-block', [
                           m('button.btn.btn-inline.btn-small.btn-terciary.w-button', {
                               onclick: actionMenuToggle.toggle
                           }, [
                               `Marcar como (${selectedItemsIDs().length})`,
                           ]),
                           (actionMenuToggle() ?
                            m('.card.dropdown-list.dropdown-list-medium.u-radius.zindex-10[id=\'transfer\']', [
                                m('a.dropdown-link.fontsize-smaller[href=\'javascript:void(0);\']', {
                                    onclick: event => displayApprovalModal.toggle()
                                }, 'Aprovada'),
                                m('a.dropdown-link.fontsize-smaller[href=\'javascript:void(0);\']', {
                                    onclick: event => displayManualModal.toggle()
                                }, 'Transferencia manual'),
                                m('a.dropdown-link.fontsize-smaller[href=\'javascript:void(0);\']', {
                                    onclick: event => displayRejectModal.toggle()
                                }, 'Recusada')
                            ]) : '')
                       ]) : '')
                  ]);
              };

        return {
            displayApprovalModal,
            displayRejectModal,
            displayManualModal,
            generateWrapperModal,
            approveSelectedIDs,
            manualTransferSelectedIDs,
            rejectSelectedIDs,
            filterVM,
            filterBuilder,
            listVM: {
                hasInputAction: true,
                inputActions,
                list: listVM,
                selectedItemsIDs,
                selectItem,
                unSelectItem,
                selectedAny,
                isSelected,
                redrawProp,
                error
            },
            data: {
                label: 'Pedidos de saque'
            },
            submit
        };
    },
    view(ctrl, args) {
        return m('', [
            m(adminFilter, {
                filterBuilder: ctrl.filterBuilder,
                submit: ctrl.submit
            }),
            (ctrl.displayApprovalModal() ? m(modalBox, {
                displayModal: ctrl.displayApprovalModal,
                content: ctrl.generateWrapperModal({
                    modalTitle: 'Aprovar saques',
                    ctaText: 'Aprovar',
                    displayModal: ctrl.displayApprovalModal,
                    onClickCallback: ctrl.approveSelectedIDs
                })
            }) : '' ),
            (ctrl.displayManualModal() ? m(modalBox, {
                displayModal: ctrl.displayManualModal,
                content: ctrl.generateWrapperModal({
                    modalTitle: 'Transferencia manual de saques',
                    ctaText: 'Aprovar',
                    displayModal: ctrl.displayManualModal,
                    onClickCallback: ctrl.manualTransferSelectedIDs
                })
            }) : '' ),
            (ctrl.displayRejectModal() ? m(modalBox, {
                displayModal: ctrl.displayRejectModal,
                content: ctrl.generateWrapperModal({
                    modalTitle: 'Rejeitar saques',
                    ctaText: 'Rejeitar',
                    displayModal: ctrl.displayRejectModal,
                    onClickCallback: ctrl.rejectSelectedIDs
                })
            }) : '' ),
            m(adminList, {
                vm: ctrl.listVM,
                listItem: adminBalanceTransferItem,
                listDetail: adminBalanceTransferItemDetail
            })
        ]);
    }
};

export default adminBalanceTranfers;
