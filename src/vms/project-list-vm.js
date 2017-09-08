import m from 'mithril';
import models from '../models';

models.adminProject.pageSize(9);
export default postgrest.paginationVM(models.adminProject, 'project_id.desc', { Prefer: 'count=exact' });
