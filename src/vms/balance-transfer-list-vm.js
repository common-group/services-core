import m from 'mithril';
import models from '../models';

export default postgrest.paginationVM(models.balanceTransfer, 'id.desc', { Prefer: 'count=exact' });
