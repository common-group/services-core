window.c.admin.Users = (function(m, c, h){
  var admin = c.admin;
  return {
    controller: function(){
      var listVM = admin.userListVM,
          filterVM = admin.userFilterVM,
          error = m.prop(''),
          itemBuilder = [
            {
              component: 'AdminUser',
              wrapperClass: '.w-col.w-col-4'
            },
          ],
          filterBuilder = [
            { //name
              component: 'FilterMain',
              data: {
                vm: filterVM.full_text_index,
                placeholder: 'Busque por nome, e-mail, Ids do usuário...',
              },
            },
          ],
          submit = function(){
            listVM.firstPage(filterVM.parameters()).then(null, function(serverError){
              error(serverError.message);
            });
            return false;
          };

      return {
        filterVM: filterVM,
        filterBuilder: filterBuilder,
        itemActions: [],
        itemDetails: [],
        itemBuilder: itemBuilder,
        listVM: {list: listVM, error: error},
        data: {label: 'Usuários'},
        submit: submit
      };
    },

    view: function(ctrl){
      return [
        m.component(c.AdminFilter,{form: ctrl.filterVM.formDescriber, filterBuilder: ctrl.filterBuilder, data: ctrl.data, submit: ctrl.submit}),
        m.component(c.AdminList, {vm: ctrl.listVM, data: ctrl.data, itemBuilder: ctrl.itemBuilder, itemActions: ctrl.itemActions, itemDetails: ctrl.itemDetails})
      ];
    }
  };
}(window.m, window.c, window.c.h));
