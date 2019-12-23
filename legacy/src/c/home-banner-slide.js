import m from 'mithril';

export const HomeBannerSlide = {
    view({attrs}) {

        const {
            slide,
            slideClass,
            sliderTransitionStyle
        } = attrs;

        return m(`.slide.w-slide.${slideClass}`, {
            style: `${sliderTransitionStyle} background-image: url(${slide.image});`
        }, [
            m('.w-container', [
                m('.w-row', [
                    m('.w-col.w-col-8.w-col-push-2', 
                        m('.w-container.u-text-center', [
                            m('.w-row.u-marginbottom-40', [
                                m('h1.fontcolor-negative.fontsize-megajumbo.u-marginbottom-20', m.trust(slide.title)),
                                m('h2.fontcolor-negative.fontsize-large', m.trust(slide.subtitle))
                            ]),
                            m('a.btn.btn-large.u-marginbottom-10.btn-inline', { href: slide.link }, slide.cta)
                        ])
                    )
                ])
            ])
        ]);
    }
};