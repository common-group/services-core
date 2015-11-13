window.c.tooltip = ((m, c, h) => {
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
                    if ((parentOffset().left + (el.offsetWidth / 2)) <= window.innerWidth && (parentOffset().left - (el.offsetWidth / 2)) >= 0){
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
                onmouseenter: ctrl.toggle,
                onmouseleave: ctrl.toggle,
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
