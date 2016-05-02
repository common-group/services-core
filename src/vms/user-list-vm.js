import m from 'mithril';
import models from '../models';

export default postgrest.paginationVM(models.user, 'id.desc', {'Prefer': 'count=exact'});
