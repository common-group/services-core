window.c.adminApp.ContributionListVM = (function(m, models) {
  m.postgrest.paginationVM(models.contributionDetail.getPageWithToken);
}(window.m, window.c.models));
