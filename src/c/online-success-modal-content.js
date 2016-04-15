/**
 * window.c.OnlineSucessModalContent component
 * Render online success message
 *
 */
window.c.OnlineSucessModalContent = ((m, h, _, models, I18n) => {
    return {
        view: (ctrl, args) => {
            return m('.modal-dialog-content.u-text-center',
                     [m('.fa.fa-check-circle.fa-5x.text-success.u-marginbottom-40'),
                       m('p.fontsize-larger.lineheight-tight', 'Sua campanha está no ar!!! Parabéns por esse primeiro grande passo. Boa sorte nessa jornada ;)')]);
        }
    };
}(window.m, window.c.h, window._, window.c.models, window.I18n));
