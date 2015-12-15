describe('YoutubeLightbox', () => {
    let $output,
        c = window.c,
        m = window.m;

    describe('view', () => {
        beforeEach(() => {
            $output = mq(c.YoutubeLightbox, {src: 'https://www.youtube.com/watch?v=FlFTcDSKnLM'});
        });

        it('should not render the lightbox at first', () => {
            expect($output.find('#lightbox').length).toEqual(0);
        });
        it('should render the lightbox on play button click', () => {
            $output.click('#youtube-play');
            expect($output.find('#lightbox').length).toEqual(1);
            expect($output.find('#video-lightbox').length).toEqual(1);
        });
        it('should close the lightbox on close button click', () => {
            $output.click('#youtube-play');
            $output.click('#youtube-close');
            expect($output.find('#lightbox').length).toEqual(0);
        });
    });
});
