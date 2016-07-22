/**
 * copyTextInput component
 * Displays a text input that copies it's content on click
 *
 * Example of use:
 * view: () => {
 *   ...
 *   m.component(copyTextInput, {value: 'some value'})
 *   ...
 * }
 */
import m from 'mithril';
import popNotification from './pop-notification';

const copyTextInput = {
    controller(args) {
        const showSuccess = m.prop(false);

        const select = (el) => {
            let range, selection;

            if (document.body.createTextRange) {
                range = document.body.createTextRange();
                range.moveToElementText(el);
                range.select();
            } else if (window.getSelection) {
                selection = window.getSelection();
                range = document.createRange();
                range.selectNodeContents(el);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        };

        const setClickHandler = (el, isInitialized) => {
            let copy;
            if (!isInitialized) {
                el.onclick = () => {
                    select(el);
                    copy = document.execCommand('copy');
                    if (copy) {
                        showSuccess(true);
                        m.redraw();
                    } else {
                        el.blur();
                    }

                };
            }
        };

        return {
            setClickHandler: setClickHandler,
            showSuccess: showSuccess
        };
    },
    view(ctrl, args) {
        return m('#clipboard', [
            m(`textarea.positive.text-field.w-input`, {
                readOnly: true,
                config: ctrl.setClickHandler,
                style: 'margin-bottom:0;'
            }, args.value
          ),
          m('span.fontweight-light.fontsize-mini.fontcolor-secondary', '(clique para copiar)'),
          ctrl.showSuccess() ? m.component(popNotification, {message: 'Link copiado'}) : ''
      ]);
    }
};

export default copyTextInput;
