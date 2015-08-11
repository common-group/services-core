window.c.admin.contributionListVM = (function(m, models) {
  var vm = m.postgrest.paginationVM(models.contributionDetail.getPageWithToken);

  vm.itemDescriber = [
    {
      type: 'user',
      wrapperClass: '.w-col.w-col-4'
    },
    {
      type: 'project',
      wrapperClass: '.w-col.w-col-4'
    },
    {
      type: 'contribution',
      wrapperClass: '.w-col.w-col-2'
    },
    {
      type: 'payment',
      wrapperClass: '.w-col.w-col-2'
    }
  ];

  return vm;
}(window.m, window.c.models));
