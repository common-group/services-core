import m from 'mithril';
import adminTransaction from '../../src/c/admin-transaction';

describe('AdminTransaction', () => {
    let contribution,
        view, $output;

    beforeAll(() => {
        contribution = m.prop(ContributionDetailMockery(1, {
            gateway_data: null
        }));

        $output = mq(m.component(adminTransaction, {
            contribution: contribution()[0]
        }).view);
    });

    describe('view', () => {
        it('should render details about contribution', () => {
            expect($output.contains('Valor: R$50,00')).toBeTrue();
            expect($output.contains('Meio: MoIP')).toBeTrue();
        });
    });
});
