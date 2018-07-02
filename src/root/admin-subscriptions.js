import m from 'mithril';
import h from '../h';
import subscriptionListVM from '../vms/subscription-list-vm';
import subscriptionFilterVM from '../vms/subscription-filter-vm';
import adminList from '../c/admin-list';
import adminFilter from '../c/admin-filter';
import adminSubscriptionItem from '../c/admin-subscription-item';
import adminSubscriptionDetail from '../c/admin-subscription-detail';
import filterDropdown from '../c/filter-dropdown';
import filterMain from '../c/filter-main';

const adminSubscriptions = {
    controller() {
        let listVM = subscriptionListVM,
            filterVM = subscriptionFilterVM,
            error = m.prop(''),
            filterBuilder = [{ // name
                component: filterMain,
                data: {
                    vm: filterVM.search_index,
                    placeholder: 'Busque por projeto, permalink, email, nome do realizador...'
                },
            }, { // state
                component: filterDropdown,
                data: {
                    label: 'Com o estado',
                    name: 'status',
                    vm: filterVM.status,
                    options: [{
                        value: '',
                        option: 'Qualquer um'
                    }, {
                        value: 'started',
                        option: 'started'
                    }, {
                        value: 'active',
                        option: 'active'
                    }, {
                        value: 'inactive',
                        option: 'inactive'
                    }, {
                        value: 'canceled',
                        option: 'canceled'
                    }, {
                        value: 'canceling',
                        option: 'canceling'
                    }, {
                        value: 'deleted',
                        option: 'deleted'
                    }, {
                        value: 'error',
                        option: 'error'
                    }]
                }
            }],
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
                label: 'Assinaturas'
            },
            submit
        };
    },

    view(ctrl) {
        const label = 'Assinaturas';
        return m('#admin-root-subscriptions', [
            m.component(adminFilter, {
                form: ctrl.filterVM.formDescriber,
                filterBuilder: ctrl.filterBuilder,
                label,
                submit: ctrl.submit
            }),
            m.component(adminList, {
                vm: ctrl.listVM,
                listItem: adminSubscriptionItem,
                listDetail: adminSubscriptionDetail
            })
        ]);
    }
};

export default adminSubscriptions;
