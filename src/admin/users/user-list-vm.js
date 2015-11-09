window.c.admin.userListVM = (function(m, models) {
    return m.postgrest.paginationVM(models.user);
}(window.m, window.c.models));
