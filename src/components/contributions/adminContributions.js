adminApp.AdminContributions = {
  controller: function(args){
    this.error = m.prop();
    var listVM = this.listVM = adminApp.ContributionListVM,
        filterVM = this.filterVM = adminApp.ContributionFilterVM;

    this.submit = function(){
      listVM.firstPage(filterVM.parameters());
      return false;
    }
  },
  view: function(ctrl) {
    return  [
      m.component(adminApp.AdminFilter,{form: ctrl.filterVM.formDescriber, submit: ctrl.submit }),
      m.component(adminApp.AdminList, {vm: ctrl.listVM })
    ];
  }
};
