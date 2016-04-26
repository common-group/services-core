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
import m from 'mithril';
import _ from 'underscore';
import h from 'h';

const adminResetPassword = {
    controller (args) {
        let builder = args.data,
            complete = m.prop(false),
            error = m.prop(false),
            fail = m.prop(false),
            key = builder.property,
            data = {},
            item = args.item;

        builder.requestOptions.config = (xhr) => {
            if (h.authenticityToken()) {
                xhr.setRequestHeader('X-CSRF-Token', h.authenticityToken());
            }
        };

        const l = m.prop(false),
            load = () => m.request(_.extend({}, {data: data}, builder.requestOptions)),
            newPassword = m.prop(''),
            error_message = m.prop('');

        const requestError = (err) => {
            l(false);
            error_message(err.errors[0]);
            complete(true);
            error(true);
        };
        const updateItem = (res) => {
            l(false);
            _.extend(item, res[0]);
            complete(true);
            error(false);
        };

        const submit = () => {
            l(true);
            data[key] = newPassword();
            load().then(updateItem, requestError);
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
    view (ctrl, args) {
        const data = args.data,
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

export default adminResetPassword;
