/**
 * window.c.AdminResetPassword component
 * Makes ajax request to update User password.
 *
 * Example:
 * m.component(c.AdminResetPassword, {
 *     data: {},
 *     item: rowFromDatabase
 * })
 */
window.c.AdminResetPassword = ((function(m, h, c, _) {
    return {
        controller: function(args) {
            let builder = args.data,
                complete = m.prop(false),
                error = m.prop(false),
                fail = m.prop(false),
                key = builder.property,
                data = {},
                item = args.item;

            builder.requestOptions.config = (xhr) => {
                if (window.document.querySelectorAll('meta[name="csrf-token"]').length > 0) {
                    xhr.setRequestHeader('X-CSRF-Token', window.document.querySelectorAll('meta[name="csrf-token"]')[0].content);
                }
            };

            const l = m.postgrest.loader(_.extend({}, {data: data}, builder.requestOptions), m.request),
                newPassword = m.prop(''),
                error_message = m.prop('');

            const requestError = (err) => {
                error_message(err.errors[0]);
                complete(true);
                error(true);
            };
            const updateItem = (res) => {
                _.extend(item, res[0]);
                complete(true);
                error(false);
            };

            const submit = () => {
                data[key] = newPassword();
                l.load().then(updateItem, requestError);
                return false;
            };

            const unload = (el, isinit, context) => {
                context.onunload = function() {
                    complete(false);
                    error(false);
                };
            };

            return {
                complete: complete,
                error: error,
                error_message: error_message,
                l: l,
                newPassword: newPassword,
                submit: submit,
                toggler: h.toggleProp(false, true),
                unload: unload
            };
        },
        view: function(ctrl, args) {
            var data = args.data,
                btnValue = (ctrl.l()) ? 'por favor, aguarde...' : data.callToAction;

            return m('.w-col.w-col-2', [
                m('button.btn.btn-small.btn-terciary', {
                    onclick: ctrl.toggler.toggle
                }, data.outerLabel), (ctrl.toggler()) ?
                m('.dropdown-list.card.u-radius.dropdown-list-medium.zindex-10', {
                    config: ctrl.unload
                }, [
                    m('form.w-form', {
                        onsubmit: ctrl.submit
                    }, (!ctrl.complete()) ? [
                        m('label', data.innerLabel),
                        m('input.w-input.text-field[type="text"][name="' + data.property + '"][placeholder="' + data.placeholder + '"]', {
                            onchange: m.withAttr('value', ctrl.newPassword),
                            value: ctrl.newPassword()
                        }),
                        m('input.w-button.btn.btn-small[type="submit"][value="' + btnValue + '"]')
                    ] : (!ctrl.error()) ? [
                        m('.w-form-done[style="display:block;"]', [
                            m('p', 'Senha alterada com sucesso.')
                        ])
                    ] : [
                        m('.w-form-error[style="display:block;"]', [
                            m('p', ctrl.error_message())
                        ])
                    ])
                ]) : ''
            ]);
        }
    };
})(window.m, window.c.h, window.c, window._));
