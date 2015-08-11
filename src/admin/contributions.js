window.c.admin.Contributions = (function(m, c, h){
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
        submit: function(){
          listVM.firstPage(filterVM.parameters()).then(null, function(serverError){
            error(serverError.message);
          });
          return false;
        }
      };
    },

    view: function(ctrl){
      return [
        m.component(c.AdminFilter,{form: ctrl.filterVM.formDescriber, submit: ctrl.submit}),
        ctrl.error() ?
          m('.card.card-error.u-radius.fontweight-bold', ctrl.error()) :
          admin.isLoading() ? h.loader() : '',
          m.component(c.AdminList, {vm: ctrl.listVM})
      ];
    }
  };
}(window.m, window.c, window.c.h));
