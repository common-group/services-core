/**
 * window.c.landingQA component
 * A visual component that displays a question/answer box with toggle
 *
 * Example:
 * view: () => {
 *      ...
 *      m.component(c.landingQA, {
 *          question: 'Whats your name?',
 *          answer: 'Darth Vader.'
 *      })
 *      ...
 *  }
 */
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
                m('.fontsize-base', args.question),
                ctrl.showAnswer() ? m('p.u-margintop-20.fontsize-small', args.answer) : ''
            ]);
        }
    };
}(window.m, window.c.h));
