describe('Slider', () => {
    let $output,
        c = window.c,
        m = window.m,
        title = 'TitleSample',
        defaultDocumentWidth = 1600,
        slides = [
            m('h1', 'teste'),
            m('h1', 'teste'),
            m('h1', 'teste'),
            m('h1', 'teste')
        ];

    describe('view', () => {
        beforeEach(() => {
            $output = mq(c.Slider, {title: title, slides: slides});
        });

        it('should render all the slides', () => {
            expect($output.find('.slide').length).toEqual(slides.length);
        });
        it('should render one bullet for each slide', () => {
            expect($output.find('.slide-bullet').length).toEqual(slides.length);
        });
        it('should move to next slide on slide next click', () => {
            $output.click('#slide-next');
            let firstSlide = $output.first('.slide');
            expect(firstSlide.attrs.style.indexOf(`-${defaultDocumentWidth}px`)).toBeGreaterThan(-1);
        });
        it('should move to previous slide on slide prev click', () => {
            $output.click('#slide-next');
            $output.click('#slide-prev');
            let firstSlide = $output.first('.slide');
            expect(firstSlide.attrs.style.indexOf('0px')).toBeGreaterThan(-1);
        });
    });
});
