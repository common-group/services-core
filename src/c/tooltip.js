/**
 * window.c.Tooltip component
 * A component that allows you to show a tooltip on
 * a specified element hover. It receives the element you want
 * to trigger the tooltip and also the text to display as tooltip.
 *
 * Example of use:
 * view: () => {
 *     let tooltip = (el) => {
 *          return m.component(c.Tooltip, {
 *              el: el,
 *              text: 'text to tooltip',
 *              width: 300
 *          })
 *     }
 *
 *     return tooltip('a#link-wth-tooltip[href="#"]');
 *
 * }
 */
window.c.Tooltip = ((m, c, h) => {
    return {
        controller: (args) => {
            let parentHeight = m.prop(0),
                width = m.prop(args.width || 280),
                top = m.prop(0),
                left = m.prop(0),
                opacity = m.prop(0),
                parentOffset = m.prop({top: 0, left: 0}),
                tooltip = h.toggleProp(0, 1),
                toggle = () => {
                    tooltip.toggle();
                    m.redraw();
                };

            const setParentPosition = (el, isInitialized) => {
                if (!isInitialized){
                    parentOffset(h.cumulativeOffset(el));
                }
            },
                setPosition = (el, isInitialized) => {
                    if (!isInitialized){
                        let elTop = el.offsetHeight + el.offsetParent.offsetHeight;
                        let style = window.getComputedStyle(el);

                        if (window.innerWidth < (el.offsetWidth + 2 * parseFloat(style.paddingLeft) + 30)){ //30 here is a safe margin
                            el.style.width = window.innerWidth - 30; //Adding the safe margin
                            left(-parentOffset().left + 15); //positioning center of window, considering margin
                        } else if ((parentOffset().left + (el.offsetWidth / 2)) <= window.innerWidth && (parentOffset().left - (el.offsetWidth / 2)) >= 0){
                            left(-el.offsetWidth / 2); //Positioning to the center
                        } else if ((parentOffset().left + (el.offsetWidth / 2)) > window.innerWidth) {
                            left(-el.offsetWidth + el.offsetParent.offsetWidth); //Positioning to the left
                        } else if ((parentOffset().left - (el.offsetWidth / 2)) < 0) {
                            left(-el.offsetParent.offsetWidth); //Positioning to the right
                        }
                        top(-elTop); //Setting top position
                    }
                };

            return {
                width: width,
                top: top,
                left: left,
                opacity: opacity,
                tooltip: tooltip,
                toggle: toggle,
                setPosition: setPosition,
                setParentPosition: setParentPosition
            };
        },
        view: (ctrl, args) => {
            let width = ctrl.width();
            return m(args.el, {
                onclick: ctrl.toggle,
                config: ctrl.setParentPosition,
                style: {cursor: 'pointer'}
            }, ctrl.tooltip() ? [
                m(`.tooltip.dark[style="width: ${width}px; top: ${ctrl.top()}px; left: ${ctrl.left()}px;"]`, {
                    config: ctrl.setPosition
                }, [
                    m('.fontsize-smallest', args.text)
                ])
            ] : '');
        }
    };
}(window.m, window.c, window.c.h));
