/**
 * window.c.projectCancelButton component
 * A button showing modal to cancel online project
 */
import m from 'mithril';
import h from '../h';
import modalBox from '../c/modal-box';
import cancelProjectModalContent from '../c/cancel-project-modal-content';

const projectCancelButton = {
    controller(args) {
        const displayCancelModal = h.toggleProp(false, true);
        return {
            displayCancelModal: displayCancelModal
        };
    },
    view(ctrl, args) {
        return m('div', [
            (ctrl.displayCancelModal() ? m.component(modalBox, {
                displayModal: ctrl.displayCancelModal,
                content: [cancelProjectModalContent, {displayModal: ctrl.displayCancelModal}]
            }) : ''),
            m('.before-footer',
                m('.w-container',
                    m('a.btn.btn-cancel.btn-inline.btn-no-border.btn-small.btn-terciary.u-marginbottom-20.u-right.w-button', {onclick: ctrl.displayCancelModal.toggle, style: {'transition': 'all 0.5s ease 0s'}},
                        [
                            m('span.fa.fa-times-circle', ''),
                            m.trust('&nbsp;'),
                            'Cancelar projeto'
                        ]
                    )
                )
            )
        ]);
    }
};

export default projectCancelButton;
