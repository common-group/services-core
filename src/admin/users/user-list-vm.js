window.c.admin.userListVM = (function(m, models) {
    return m.postgrest.paginationVM(models.userFullDetail);
}(window.m, window.c.models));
