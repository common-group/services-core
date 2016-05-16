/**
 * window.c.OnlineSucessModalContent component
 * Render online success message
 *
 */
import m from 'mithril';

const onlineSucessModalContent = {
    view (ctrl, args) {
        return m('.modal-dialog-content.u-text-center', [
            m('.fa.fa-check-circle.fa-5x.text-success.u-marginbottom-40'),
            m('p.fontsize-larger.lineheight-tight', 'Sua campanha está no ar!!! Parabéns por esse primeiro grande passo. Boa sorte nessa jornada ;)')
        ]);
    }
}

export default onlineSucessModalContent;
