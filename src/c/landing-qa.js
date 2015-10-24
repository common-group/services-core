window.c.landingQA = (function(m, h) {
    return {
        controller: (args) => {
            return {
                showAnswer: h.toggleProp(false, true)
            };
        },
        view: (ctrl, args) => {
            return m('.card.qa-card.u-marginbottom-20.u-radius.btn-terciary', {
                onclick: ctrl.showAnswer.toggle
            },[
                m('.w-editable.fontsize-base', args.question),
                ctrl.showAnswer() ? m('p.w-editable.u-margintop-20.fontsize-small', args.answer) : ''
            ]);
        }
    };
}(window.m, window.c.h));
