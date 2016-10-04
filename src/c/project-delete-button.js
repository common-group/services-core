/**
 * window.c.projectDeleteButton component
 * A button showing modal to delete draft project
 */
import m from 'mithril';
import h from '../h';
import modalBox from '../c/modal-box';
import deleteProjectModalContent from '../c/delete-project-modal-content';

const projectDeleteButton = {
    controller(args) {
        const displayDeleteModal = h.toggleProp(false, true);
        return {
          displayDeleteModal: displayDeleteModal
        };
    },
    view(ctrl, args) {
        return m('div', [
            (ctrl.displayDeleteModal() ? m.component(modalBox, {
                displayModal: ctrl.displayDeleteModal,
                content: [deleteProjectModalContent, {displayDeleteModal: ctrl.displayDeleteModal, project: args.project}]
            }) : ''),
        m('.before-footer',
              m('.w-container',
                m('a.btn.btn-inline.btn-no-border.btn-small.btn-terciary.u-marginbottom-20.u-right.w-button[href=\'javascript:void(0);\']', {onclick: ctrl.displayDeleteModal.toggle, style: {'transition': 'all 0.5s ease 0s'}},
                  [
                    m.trust('&nbsp;'),
                    'Deletar projeto ',
                    m('span.fa.fa-trash', ''
                    )
                  ]
                )
              )
            )]);
    }
};

export default projectDeleteButton;
