/**
 * window.c.Slider component
 * Build a slider from any array of mithril elements
 *
 * Example of use:
 * view: () => {
 *     ...
 *     m.component(c.Slider, {
 *         slides: [m('slide1'), m('slide2'), m('slide3')],
 *         title: 'O que estão dizendo por aí...'
 *     })
 *     ...
 * }
 */
window.c.Slider = ((m, _) => {
    return {
        controller: (args) => {
            const selectedSlideIdx = m.prop(0),
                translationSize = m.prop(1600),
                decrementSlide = () => {
                    if (selectedSlideIdx() > 0) {
                        selectedSlideIdx(selectedSlideIdx() - 1);
                    } else {
                        selectedSlideIdx(args.slides.length - 1);
                    }
                },
                incrementSlide = () => {
                    if (selectedSlideIdx() < (args.slides.length - 1)) {
                        selectedSlideIdx(selectedSlideIdx() + 1);
                    } else {
                        selectedSlideIdx(0);
                    }
                },
                changeSlideTimer = setInterval(() => {
                    incrementSlide();
                    m.redraw();
                }, 6500),
                config = (el, isInitialized, context) => {
                    if (!isInitialized){
                        translationSize(Math.max(document.documentElement.clientWidth, window.innerWidth || 0));
                        m.redraw();
                    };

                    context.onunload = () => clearInterval(changeSlideTimer);
                };

            return {
                config: config,
                selectedSlideIdx: selectedSlideIdx,
                translationSize: translationSize,
                decrementSlide: decrementSlide,
                incrementSlide: incrementSlide
            };
        },
        view: (ctrl, args) => {
            return m('.w-slider.slide-testimonials', {
                config: ctrl.config
            }, [
                m('.fontsize-larger', args.title),
                m('.w-slider-mask', [
                    _.map(args.slides, (slide, idx) => {
                        let translateValue = (idx - ctrl.selectedSlideIdx()) * ctrl.translationSize(),
                            translateStr = `translate3d(${translateValue}px, 0, 0)`;

                        return m('.slide.w-slide.slide-testimonials-content', {
                            style: `transform: ${translateStr}; -webkit-transform: ${translateStr}; -ms-transform:${translateStr};`
                        }, [
                            m('.w-container', [
                                m('.w-row', [
                                    m('.w-col.w-col-8.w-col-push-2', slide)
                                ])
                            ])
                        ]);
                    }),
                    m('#slide-prev.w-slider-arrow-left.w-hidden-small.w-hidden-tiny', {
                        onclick: () => ctrl.decrementSlide()
                    },[
                        m('.w-icon-slider-left.fa.fa-chevron-left.fontcolor-terciary')
                    ]),
                    m('#slide-next.w-slider-arrow-right.w-hidden-small.w-hidden-tiny', {
                        onclick: () => ctrl.incrementSlide()
                    },[
                        m('.w-icon-slider-right.fa.fa-chevron-right.fontcolor-terciary')
                    ]),
                    m('.w-slider-nav.w-slider-nav-invert.w-round.slide-nav', _(args.slides.length).times((idx) => {
                        return m(`.slide-bullet.w-slider-dot${ctrl.selectedSlideIdx() === idx ? '.w-active' : ''}`, {
                            onclick: () => ctrl.selectedSlideIdx(idx)
                        });
                    }))
                ])
            ]);
        }
    };
}(window.m, window._));
