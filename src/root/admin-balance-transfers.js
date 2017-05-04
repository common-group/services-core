import m from 'mithril';
import h from '../h';
import balanceTransferListVM from '../vms/balance-transfer-list-vm';
import balanceTransferFilterVM from '../vms/balance-transfer-filter-vm';
import adminList from '../c/admin-list';
import adminFilter from '../c/admin-filter';
import filterMain from '../c/filter-main';
import adminBalanceTransferItem from '../c/admin-balance-transfer-item';
import adminBalanceTransferItemDetail from '../c/admin-balance-transfer-item-detail';

const adminBalanceTransfers = {
    controller(args) {
        const listVM = balanceTransferListVM,
              filterVM = balanceTransferFilterVM,
              error = m.prop(''),
              filterBuilder = [
                  {
                      component: filterMain,
                      data: {
                          vm: filterVM.full_text_index,
                          placeholder: 'Busque pelo email, ids do usuario, ids de transferencia e eventos de saldo'
                      }
                  }
              ],
              submit = () => {
                  error(false);
                  listVM.firstPage(filterVM.parameters()).then(null, (serverError) => {
                      error(serverError.message);
                  });

                  return false;
              };

        return {
            filterVM,
            filterBuilder,
            listVM: {
                list: listVM,
                error
            },
            data: {
                label: 'Pedidos de saque'
            },
            submit
        };
    },
    view(ctrl, args) {
        return [
            m(adminFilter, {
                filterBuilder: ctrl.filterBuilder,
                submit: ctrl.submit
            }),
            m(adminList, {
                vm: ctrl.listVM,
                listItem: adminBalanceTransferItem,
                listDetail: adminBalanceTransferItemDetail
            })
        ];
    }
};

export default adminBalanceTransfers;
