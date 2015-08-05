window.c.adminApp.ContributionListVM = (function(m, models) {
  m.postgrest.paginationVM(models.ContributionDetail.getPageWithToken);
}(window.m, window.c.models));
