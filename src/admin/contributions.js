window.c.admin.Contributions = (function(m, c){
  var admin = c.admin;
  return {
    controller: function(){
      var listVM = admin.contributionListVM,
          filterVM = admin.contributionFilterVM;

      return {
        listVM: listVM,
        filterVM: filterVM,
        submit: function() {
          listVM.firstPage(filterVM.parameters()).then(null, function(serverError){
            admin.error(serverError.message);
          });
          return false;
        }
      };
    },

    view: function(ctrl) {
      return [
        m.component(c.AdminFilter,{form: ctrl.filterVM.formDescriber, submit: ctrl.submit}),
        admin.error() ?
          m('.card.card-error.u-radius.fontweight-bold', admin.error()) :
          m.component(c.AdminList, {vm: ctrl.listVM})
      ];
    }
  };
}(window.m, window.c));
