/**
 * window.c.ModalBox component
 * Buils the template for using modal
 *
 * Example:
 * m.component(c.ModalBox, {
 *     displayModal: tooglePropObject,
 *     content: ['ComponentName', {argx: 'x', argy: 'y'}]
 * })
 * ComponentName structure =>  m('div', [
 *                  m('.modal-dialog-header', []),
 *                  m('.modal-dialog-content', []),
 *                  m('.modal-dialog-nav-bottom', []),
 *              ])
 */
import m from 'mithril';

const modalBox = {
    view: function(ctrl, args) {
        return m('.modal-backdrop', [
            m('.modal-dialog-outer', [
                m('.modal-dialog-inner.modal-dialog-small.fontcolor-primary', [
                    m(`a.w-inline-block.fa.fa-lg.modal-close${args.hideCloseButton ? '' : '.fa-close'}[href="javascript:void(0);"]`, {
                        onclick: args.displayModal.toggle
                    }),
                    m(args.content[0], args.content[1])
                ]),
            ])
        ]);
    }
};

export default modalBox;
