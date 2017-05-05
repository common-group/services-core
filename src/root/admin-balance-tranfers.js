import m from 'mithril';
import h from '../h';
import balanceTransferListVM from '../vms/balance-transfer-list-vm';
import balanceTransferFilterVM from '../vms/balance-transfer-filter-vm';
import adminList from '../c/admin-list';
import adminFilter from '../c/admin-filter';
import filterMain from '../c/filter-main';
import filterDropdown from '../c/filter-dropdown';
import filterDateField from '../c/filter-date-field';
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
                      component: filterDateField,
                      data: {
                          label: 'Data da solicitação',
                          vm: filterVM.created_date
                      }

                  },
                  {
                      component: filterDateField,
                      data: {
                          label: 'Data da confirmação',
                          vm: filterVM.transferred_date
                      }

                  }
              ],
              selectedItemsIDs = m.prop([]),
              displayApprovalModal = h.toggleProp(false, true),
              displayRejectModal = h.toggleProp(false, true),
              selectAllLoading = m.prop(false),
              redrawProp = m.prop(false),
              isSelected = (item_id) => {
                  return _.find(selectedItemsIDs(), (i) => {
                      return i.id == item_id;
                  });
              },
              selectItem = (item) => {
                  if (!_.find(selectedItemsIDs(), (i) => { return i.id == item.id; })) {
                      selectedItemsIDs().push(item);
                      redrawProp(true);
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
                          return m('', [
                              m('.modal-dialog-header', [
                                  m('.fontsize-large.u-text-center', args.modalTitle)
                              ]),
                              m('.modal-dialog-content', [
                                  _.map(selectedItemsIDs(), (item, index) => {
                                      return m('.divider.fontsize-smallest.lineheight-looser', [
                                          m('.w-row.fontweight-semibold', [
                                              m('.w-col.w-col-4', [
                                                  m('', item.user_name),
                                              ]),
                                              m('.w-col.w-col-4', [
                                                  m('span', `R$ ${h.formatNumber(item.amount, 2, 3)}`)
                                              ]),
                                              m('.w-col.w-col-4', [
                                                  m('.fontsize-smallest', [
                                                      'Solicitado em: ',
                                                      m('span.fontsize-small.lineheight-tightest', h.momentify(item.created_at)),
                                                  ])
                                              ]),
                                          ])
                                      ]);
                                  })
                              ]),
                              m('.modal-dialog-nav-bottom', [
                                  m('.w-row', [
                                      m('.w-col.w-col-4.w-col-push-4',
                                        m('button.btn.btn-large.btn-terciary', {
                                            onclick: args.onClickCallback
                                        },
                                          args.ctaText
                                         )
                                       ),
                                  ])
                              ]),
                          ]);
                      }
                  };

                  return [wrapper, customAttrs];
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
                      listVM.firstPage();
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
                  redrawProp(true);
                  m.redraw();
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
                      m('button.btn.btn-inline.btn-small.btn-terciary.u-marginright-20.w-button', { onclick: selectAll }, (selectAllLoading() ? 'carregando...' : `Selecionar todos (${selectedItemsIDs().length})`)),
                      (selectedItemsIDs().length > 1 ? m('button.btn.btn-inline.btn-small.btn-terciary.u-marginright-20.w-button', { onclick: unSelectAll }, `Desmarcar todos (${selectedItemsIDs().length})`) : ''),
                      (selectedAny() ?
                       m('button.btn.btn-inline.btn-small.btn-terciary.u-marginright-20.w-button', {
                           onclick: displayApprovalModal.toggle
                       }, `Aprovar (${selectedItemsIDs().length})`) : ''),
                      (selectedAny() ?
                       m('button.btn.btn-inline.btn-small.btn-terciary.u-marginright-20.w-button', {
                           onclick: displayRejectModal.toggle
                       }, `Rejeitar (${selectedItemsIDs().length})`) : '')
                  ]);
              };

        return {
            displayApprovalModal,
            displayRejectModal,
            generateWrapperModal,
            approveSelectedIDs,
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
                    onClickCallback: ctrl.approveSelectedIDs
                })
            }) : '' ),
            (ctrl.displayRejectModal() ? m(modalBox, {
                displayModal: ctrl.displayRejectModal,
                content: ctrl.generateWrapperModal({
                    modalTitle: 'Rejeitar saques',
                    ctaText: 'Rejeitar',
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
