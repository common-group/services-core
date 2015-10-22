window.c.admin.Contributions = (function(m, c, h) {
    var admin = c.admin;
    return {
        controller: function() {
            var listVM = admin.contributionListVM,
                filterVM = admin.contributionFilterVM,
                error = m.prop(''),
                filterBuilder = [{ //full_text_index
                    component: 'FilterMain',
                    data: {
                        vm: filterVM.full_text_index,
                        placeholder: 'Busque por projeto, email, Ids do usuário e do apoio...'
                    }
                }, { //state
                    component: 'FilterDropdown',
                    data: {
                        label: 'Com o estado',
                        name: 'state',
                        vm: filterVM.state,
                        options: [{
                            value: '',
                            option: 'Qualquer um'
                        }, {
                            value: 'paid',
                            option: 'paid'
                        }, {
                            value: 'refused',
                            option: 'refused'
                        }, {
                            value: 'pending',
                            option: 'pending'
                        }, {
                            value: 'pending_refund',
                            option: 'pending_refund'
                        }, {
                            value: 'refunded',
                            option: 'refunded'
                        }, {
                            value: 'chargeback',
                            option: 'chargeback'
                        }, {
                            value: 'deleted',
                            option: 'deleted'
                        }]
                    }
                }, { //gateway
                    component: 'FilterDropdown',
                    data: {
                        label: 'gateway',
                        name: 'gateway',
                        vm: filterVM.gateway,
                        options: [{
                            value: '',
                            option: 'Qualquer um'
                        }, {
                            value: 'Pagarme',
                            option: 'Pagarme'
                        }, {
                            value: 'MoIP',
                            option: 'MoIP'
                        }, {
                            value: 'PayPal',
                            option: 'PayPal'
                        }, {
                            value: 'Credits',
                            option: 'Créditos'
                        }]
                    }
                }, { //value
                    component: 'FilterNumberRange',
                    data: {
                        label: 'Valores entre',
                        first: filterVM.value.gte,
                        last: filterVM.value.lte
                    }
                }, { //created_at
                    component: 'FilterDateRange',
                    data: {
                        label: 'Período do apoio',
                        first: filterVM.created_at.gte,
                        last: filterVM.created_at.lte
                    }
                }],
                submit = function() {
                    error(false);
                    listVM.firstPage(filterVM.parameters()).then(null, function(serverError) {
                        error(serverError.message);
                    });
                    return false;
                };

            return {
                filterVM: filterVM,
                filterBuilder: filterBuilder,
                listVM: {
                    list: listVM,
                    error: error
                },
                data: {
                    label: 'Apoios'
                },
                submit: submit
            };
        },

        view: function(ctrl) {
            return [
                m.component(c.AdminFilter, {
                    form: ctrl.filterVM.formDescriber,
                    filterBuilder: ctrl.filterBuilder,
                    submit: ctrl.submit
                }),
                m.component(c.AdminList, {
                    vm: ctrl.listVM,
                    listItem: c.AdminContributionItem,
                    listDetail: c.AdminContributionDetail
                })
            ];
        }
    };
}(window.m, window.c, window.c.h));
