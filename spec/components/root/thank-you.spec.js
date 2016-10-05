import thankYou from '../../../src/root/thank-you'

fdescribe('ThankYou', () => {
    let $output;
    let test = {

    };

    beforeAll(() => {
        $output = mq(m(thankYou, test));
    });

    it('should render a thank you page', () => {
        $output.should.have('#thank-you');
    });

    it('should render a thank you message if not slip payment', () => {
        $output.should.have('.thank-you');
    });

    it('should render share buttons', () => {
        // 3 desktop share buttons
        expect($output.find('.btn-large').length).toEqual(3)
    });

    it('should render 3 recommended projects if not slip payment', () => {
        expect($output.find('.project-card').length).toEqual(3);
    });

    it('should render the slip iframe if slip payment', () => {
        expect($output.has('iframe.slip')).toBeTrue();
    });
});
