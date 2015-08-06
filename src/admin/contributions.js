window.c.admin.Contributions = (function(m, adminApp){
  return {
    controller: function(){
      var listVM = adminApp.ContributionListVM,
          filterVM = adminApp.ContributionFilterVM;

      return {
        listVM: listVM,
        filterVM: filterVM,
        submit: function() {
          listVM.firstPage(filterVM.parameters()).then(null, function(serverError){
            adminApp.error(serverError.message);
          });
          return false;
        }
      };
    },
    view: function(ctrl) {
      return [
        m.component(adminApp.AdminFilter,{form: ctrl.filterVM.formDescriber, submit: ctrl.submit}),
        adminApp.error() ?
          m('.card.card-error.u-radius.fontweight-bold', adminApp.error()) :
          m.component(adminApp.AdminList, {vm: ctrl.listVM})
      ];
    }
  };
}(window.m, window.c.admin));
