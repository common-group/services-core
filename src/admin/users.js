window.c.admin.Users = (function(m, c, h) {
    var admin = c.admin;
    return {
        controller: function() {
            var listVM = admin.userListVM,
                filterVM = admin.userFilterVM,
                error = m.prop(''),
                itemBuilder = [{
                    component: 'AdminUser',
                    wrapperClass: '.w-col.w-col-4'
                }],
                filterBuilder = [{ //name
                    component: 'FilterMain',
                    data: {
                        vm: filterVM.full_text_index,
                        placeholder: 'Busque por nome, e-mail, Ids do usuário...',
                    },
                }, { //status
                    component: 'FilterDropdown',
                    data: {
                        label: 'Com o estado',
                        index: 'status',
                        name: 'deactivated_at',
                        vm: filterVM.deactivated_at,
                        options: [{
                            value: '',
                            option: 'Qualquer um'
                        }, {
                            value: null,
                            option: 'ativo'
                        }, {
                            value: !null,
                            option: 'desativado'
                        }]
                    }
                }],
                submit = function() {
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
                submit: submit
            };
        },

        view: function(ctrl) {
            const label = 'Usuários';

            return [
                m.component(c.AdminFilter, {
                    form: ctrl.filterVM.formDescriber,
                    filterBuilder: ctrl.filterBuilder,
                    label: label,
                    submit: ctrl.submit
                }),
                m.component(c.AdminList, {
                    vm: ctrl.listVM,
                    label: label,
                    listItem: c.AdminUserItem,
                    listDetail: c.AdminUserDetail
                })
            ];
        }
    };
}(window.m, window.c, window.c.h));
