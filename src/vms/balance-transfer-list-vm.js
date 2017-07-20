import m from 'mithril';
import models from '../models';

export default postgrest.paginationVM(models.balanceTransfer, 'created_at.asc', { Prefer: 'count=exact' });
