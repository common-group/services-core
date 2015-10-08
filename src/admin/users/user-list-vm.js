window.c.admin.userListVM = (function(m, models) {
  return m.postgrest.paginationVM(models.userDetail);
}(window.m, window.c.models));
