window.c.admin.userListVM = (function(m, models) {
    return m.postgrest.paginationVM(models.user, 'id.desc', {'Prefer': 'count=exact'});
}(window.m, window.c.models));
