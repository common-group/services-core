window.c.admin.userListVM = (function(m, models) {
  return m.postgrest.paginationVM(models.userDetail.getPageWithToken);
}(window.m, window.c.models));
