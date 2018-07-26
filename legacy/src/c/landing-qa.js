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
import m from 'mithril';
import h from '../h';

const landingQA = {
    controller: function(args) {
        return {
            showAnswer: h.toggleProp(false, true)
        };
    },
    view: function(ctrl, args) {
        return m('.card.qa-card.u-marginbottom-20.u-radius.btn-terciary', [
            m('.fontsize-base', {
                onclick: () => {
                    ctrl.showAnswer.toggle();
                    args.onclick && args.onclick();
                }
            }, args.question),
            ctrl.showAnswer() ? m('p.u-margintop-20.fontsize-small', m.trust(args.answer)) : ''
        ]);
    }
};

export default landingQA;
