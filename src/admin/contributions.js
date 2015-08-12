window.c.admin.Contributions = (function(m, c){
  var admin = c.admin;
  return {
    controller: function(){
      var listVM = admin.contributionListVM,
          filterVM = admin.contributionFilterVM,
          error = m.prop('');

      return {
        listVM: {list: listVM, error: error},
        filterVM: filterVM,
        error: error,
        submit: function() {
          listVM.firstPage(filterVM.parameters()).then(null, function(serverError){
            error(serverError.message);
          });
          return false;
        }
      };
    },

    view: function(ctrl) {
      return [
        m.component(c.AdminFilter,{form: ctrl.filterVM.formDescriber, submit: ctrl.submit}),
        ctrl.error() ?
          m('.card.card-error.u-radius.fontweight-bold', ctrl.error()) :
          m.component(c.AdminList, {vm: ctrl.listVM})
      ];
    }
  };
}(window.m, window.c));
