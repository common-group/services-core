window.c.admin.Contributions = (function(m, c, h){
  var admin = c.admin;
  return {
    controller: function(){
      var listVM = admin.contributionListVM,
          filterVM = admin.contributionFilterVM,
          itemBuilder = [
            {
              component: 'AdminUser',
              wrapperClass: '.w-col.w-col-4'
            },
            {
              component: 'AdminProject',
              wrapperClass: '.w-col.w-col-4'
            },
            {
              component: 'AdminContribution',
              wrapperClass: '.w-col.w-col-2'
            },
            {
              component: 'PaymentStatus',
              wrapperClass: '.w-col.w-col-2'
            }
          ],
          error = m.prop('');
      var submit = function(){
        listVM.firstPage(filterVM.parameters()).then(null, function(serverError){
          error(serverError.message);
        });
        return false;
      };

      return {
        filterVM: filterVM,
        itemBuilder: itemBuilder,
        listVM: {list: listVM, error: error},
        submit: submit
      };
    },

    view: function(ctrl){
      return [
        m.component(c.AdminFilter,{form: ctrl.filterVM.formDescriber, submit: ctrl.submit}),
        ctrl.error() ?
          m('.card.card-error.u-radius.fontweight-bold', ctrl.error()) :
          admin.isLoading() ? h.loader() : '',
          m.component(c.AdminList, {vm: ctrl.listVM, itemBuilder: ctrl.itemBuilder})
      ];
    }
  };
}(window.m, window.c, window.c.h));
