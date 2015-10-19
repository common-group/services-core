describe('AdminTransaction', () => {
    let c = window.c,
        contribution, detailedBox,
        view, $output;

    beforeAll(() => {
        contribution = m.prop(ContributionDetailMockery(1, {
            gateway_data: null
        }));
        detailedBox = m.component(c.AdminTransaction, {
            contribution: contribution()[0]
        });
        view = detailedBox.view(null, {
            contribution: contribution
        });
        $output = mq(view);
    });

    describe('view', () => {
        it('should render details about contribution', () => {
            expect($output.contains('Valor: R$50,00')).toBeTrue();
            expect($output.contains('Meio: MoIP')).toBeTrue();
        });
    });
});