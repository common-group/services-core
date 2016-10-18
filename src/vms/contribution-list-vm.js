import m from 'mithril';
import models from '../models';

export default postgrest.paginationVM(models.contributionDetail, 'id.desc', {'Prefer': 'count=exact'});
