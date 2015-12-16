/**
 * window.c.youtubeLightbox component
 * A visual component that displays a lightbox with a youtube video
 *
 * Example:
 * view: () => {
 *      ...
 *      m.component(c.youtubeLightbox, {src: 'https://www.youtube.com/watch?v=FlFTcDSKnLM'})
 *      ...
 *  }
 */
window.c.YoutubeLightbox = ((m, c, h, models) => {
    return {
        controller: () => {
            const showLightbox = h.toggleProp(false, true);

            return {
                showLightbox: showLightbox
            };
        },
        view: (ctrl, args) => {
            return m('#youtube-lightbox', [
                m('a#youtube-play.w-lightbox.w-inline-block.fa.fa-play-circle.fontcolor-negative.fa-5x[href=\'javascript:void(0);\']', {onclick: ctrl.showLightbox.toggle}),
                ctrl.showLightbox() ?
                m('#lightbox.w-lightbox-backdrop', [
                    m('.w-lightbox-container', [
                        m('.w-lightbox-content', [
                            m('.w-lightbox-view', [
                                m('.w-lightbox-frame', [
                                    m('figure.w-lightbox-figure', [
                                        m('img.w-lightbox-img.w-lightbox-image[src=\'data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%22940%22%20height=%22528%22/%3E\']'),
                                        m(`iframe#video-lightbox.embedly-embed.w-lightbox-embed[allowfullscreen=\'\'][frameborder=\'0\'][height=\'528\'][scrolling=\'no\'][src=\'https://cdn.embedly.com/widgets/media.html?src=https%3A%2F%2Fwww.youtube.com%2Fembed%2FFlFTcDSKnLM%3Fautoplay%3D1%26feature%3Doembed&url=${encodeURI(args.src)}&image=https%3A%2F%2Fi.ytimg.com%2Fvi%2FFlFTcDSKnLM%2Fhqdefault.jpg&key=c4e54deccf4d4ec997a64902e9a30300&autoplay=1&type=text%2Fhtml&schema=youtube\'][width=\'940\']`)
                                    ])
                                ])
                            ]),
                            m('.w-lightbox-spinner.w-lightbox-hide'),
                            m('.w-lightbox-control.w-lightbox-left.w-lightbox-inactive'),
                            m('.w-lightbox-control.w-lightbox-right.w-lightbox-inactive'),
                            m('#youtube-close.w-lightbox-control.w-lightbox-close', {onclick: ctrl.showLightbox.toggle})
                        ]),
                        m('.w-lightbox-strip')
                    ])
                ]) : ''
            ]);
        }
    };
}(window.m, window.c, window.c.h, window.c.models));
