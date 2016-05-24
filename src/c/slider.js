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

import m from 'mithril';
import _ from 'underscore';

const slider = {
    controller(args) {
        let interval;
        const selectedSlideIdx = m.prop(0),
            translationSize = m.prop(1600),
            sliderTime = args.sliderTime || 6500,
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
            startSliderTimer = () => {
                interval = setInterval(() => {
                    incrementSlide();
                    m.redraw();
                }, sliderTime);
            },
            resetSliderTimer = () => {
                clearInterval(interval);
                startSliderTimer();
            },
            config = (el, isInitialized, context) => {
                if (!isInitialized){
                    translationSize(Math.max(document.documentElement.clientWidth, window.innerWidth || 0));
                    m.redraw();
                };

                context.onunload = () => clearInterval(interval);
            };

        startSliderTimer();

        return {
            config: config,
            selectedSlideIdx: selectedSlideIdx,
            translationSize: translationSize,
            decrementSlide: decrementSlide,
            incrementSlide: incrementSlide,
            resetSliderTimer: resetSliderTimer
        };
    },
    view(ctrl, args) {
        const slideClass = args.slideClass || '',
            wrapperClass = args.wrapperClass || '',
            effect = args.effect || 'slide',
            sliderClick = (fn, param) => {
                fn(param);
                ctrl.resetSliderTimer();
                args.onchange && args.onchange()
            },
            effectStyle = (idx, translateStr) => {
                const slideFx = `transform: ${translateStr}; -webkit-transform: ${translateStr}; -ms-transform:${translateStr}`,
                    fadeFx = idx === ctrl.selectedSlideIdx() ? 'opacity: 1; visibility: visible;' : 'opacity: 0; visibility: hidden;';

                return effect === 'fade' ? fadeFx : slideFx;
            };

        return m(`.w-slider.${wrapperClass}`, {
            config: ctrl.config
        }, [
            m('.fontsize-larger', args.title),
            m('.w-slider-mask', [
                _.map(args.slides, (slide, idx) => {
                    let translateValue = (idx - ctrl.selectedSlideIdx()) * ctrl.translationSize(),
                        translateStr = `translate3d(${translateValue}px, 0, 0)`;

                    return m(`.slide.w-slide.${slideClass}`, {
                        style: `${effectStyle(idx, translateStr)} ${slide.customStyle}`
                    }, [
                        m('.w-container', [
                            m('.w-row', [
                                m('.w-col.w-col-8.w-col-push-2', slide.content)
                            ])
                        ])
                    ]);
                }),
                m('#slide-prev.w-slider-arrow-left.w-hidden-small.w-hidden-tiny', {
                    onclick: () => sliderClick(ctrl.decrementSlide)
                },[
                    m('.w-icon-slider-left.fa.fa-lg.fa-angle-left.fontcolor-terciary')
                ]),
                m('#slide-next.w-slider-arrow-right.w-hidden-small.w-hidden-tiny', {
                    onclick: () => sliderClick(ctrl.incrementSlide)
                },[
                    m('.w-icon-slider-right.fa.fa-lg.fa-angle-right.fontcolor-terciary')
                ]),
                m('.w-slider-nav.w-slider-nav-invert.w-round.slide-nav', _(args.slides.length).times((idx) => {
                    return m(`.slide-bullet.w-slider-dot${ctrl.selectedSlideIdx() === idx ? '.w-active' : ''}`, {
                        onclick: () => sliderClick(ctrl.selectedSlideIdx, idx)
                    });
                }))
            ])
        ]);
    }
};

export default slider;
