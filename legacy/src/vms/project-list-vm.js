import m from 'mithril';
import models from '../models';
import { catarse } from '../api';

models.adminProject.pageSize(9);
export default catarse.paginationVM(models.adminProject, 'pledged.desc', { Prefer: 'count=exact' });
