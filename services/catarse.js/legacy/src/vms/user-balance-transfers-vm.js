import m from 'mithril';
import _ from 'underscore';
import models from '../models';
import { catarse } from '../api';


// Defined for UI (balance transfers history is shown in pages of 3 in a row)
models.userBalanceTransfers.pageSize(3);

const userBalanceTransfersPager = catarse.paginationVM(models.userBalanceTransfers, 'requested_in.desc', { Prefer: 'count=exact' });

const userBalanceTransfersVM = {
    getWithPagination : userBalanceTransfersPager
};


export default userBalanceTransfersVM;