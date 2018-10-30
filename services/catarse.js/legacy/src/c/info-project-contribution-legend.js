import m from 'mithril';
import h from '../h';
import modalBox from './modal-box';

const InfoProjectContributionLegend = {
    oninit: function(vnode) {
        return {
            modalToggle: h.toggleProp(false, true)
        };
    },
    view: function({state, attrs}) {
        return m('span', [
            args.text,
            m.trust('&nbsp;'),
            m('a.fa.fa-question-circle.fontcolor-secondary[href="#"]', {
                onclick: ctrl.modalToggle.toggle
            }, ''),
            (ctrl.modalToggle() ? m(modalBox, {
                displayModal: ctrl.modalToggle,
                content: args.content
            }) : '')
        ]);
    }
};

export default InfoProjectContributionLegend;
