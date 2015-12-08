describe('Tooltip', () => {
    let $output,
        c = window.c,
        m = window.m,
        element = 'a#tooltip-trigger[href="#"]',
        text = 'tooltipText',
        tooltip = (el) => {
            return m.component(c.Tooltip, {
                el: el,
                text: text,
                width: 320
            });
        };

    describe('view', () => {
        beforeEach(() => {
            $output = mq(tooltip(element));
        });

        it('should not render the tooltip at first', () => {
            expect($output.find('.tooltip').length).toEqual(0);
        });
        it('should render the tooltip on element mouseenter', () => {
            $output.click('#tooltip-trigger');
            expect($output.find('.tooltip').length).toEqual(1);
            expect($output.contains(text)).toBeTrue();
        });
        it('should hide the tooltip again on element mouseleave', () => {
            $output.click('#tooltip-trigger');
            $output.click('#tooltip-trigger');
            expect($output.find('.tooltip').length).toEqual(0);
        });
    });
});