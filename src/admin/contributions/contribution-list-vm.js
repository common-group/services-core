window.c.admin.contributionListVM = (function(m, models) {
    return m.postgrest.paginationVM(models.contributionDetail, 'id.desc', {'Prefer': 'count=exact'});
}(window.m, window.c.models));
