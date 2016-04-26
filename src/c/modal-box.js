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
    view (ctrl, args) {
        return m('.modal-backdrop', [
            m('.modal-dialog-outer', [
                m('.modal-dialog-inner.modal-dialog-small', [
                    m('a.w-inline-block.modal-close.fa.fa-close.fa-lg[href="javascript:void(0);"]', {
                        onclick: args.displayModal.toggle
                    }),
                    m.component(args.content[0], args.content[1])
                ]),
            ])
        ]);
    }
}

export default modalBox;
