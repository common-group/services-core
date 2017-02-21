import m from 'mithril';
import h from '../h';
import modalBox from './modal-box';

const InfoProjectContributionLegend = {
    controller(args) {
        return {
            modalToggle: h.toggleProp(false, true)
        };
    },
    view(ctrl, args) {
        return m('span', [
            args.text,
            m.trust('&nbsp;'),
            m('a.fa.fa-question-circle.fontcolor-secondary[href="#"]', {
                onclick: ctrl.modalToggle.toggle
            }, ''),
            (ctrl.modalToggle() ? m.component(modalBox, {
                displayModal: ctrl.modalToggle,
                content: args.content
            }) : '')
        ]);
    }
};

export default InfoProjectContributionLegend;
