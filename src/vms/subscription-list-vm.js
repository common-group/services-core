import m from 'mithril';
import { commonPayment } from '../api';
import models from '../models';

export default commonPayment.paginationVM(models.userSubscription, 'id.desc', { Prefer: 'count=exact' });
