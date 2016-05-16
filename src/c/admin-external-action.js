/**
 * window.c.AdminExternalAction component
 * Makes arbitrary ajax requests and update underlying
 * data from source endpoint.
 *
 * Example:
 * m.component(c.AdminExternalAction, {
 *     data: {},
 *     item: rowFromDatabase
 * })
 */
import m from 'mithril';
import _ from 'underscore';
import h from '../h';

const adminExternalAction = {
    controller (args) {
        let builder = args.data,
            complete = m.prop(false),
            error = m.prop(false),
            fail = m.prop(false),
            data = {},
            item = args.item;

        builder.requestOptions.config = (xhr) => {
            if (h.authenticityToken()) {
                xhr.setRequestHeader('X-CSRF-Token', h.authenticityToken());
            }
        };

        const reload = _.compose(builder.model.getRowWithToken, h.idVM.id(item[builder.updateKey]).parameters),
            l = m.prop(false);

        const reloadItem = () => reload().then(updateItem);

        const requestError = (err) => {
            l(false);
            complete(true);
            error(true);
        };

        const updateItem = (res) => {
            _.extend(item, res[0]);
            complete(true);
            error(false);
        };

        const submit = () => {
            l(true);
            m.request(builder.requestOptions).then(reloadItem, requestError);
            return false;
        };

        const unload = (el, isinit, context) => {
            context.onunload = function() {
                complete(false);
                error(false);
            };
        };

        return {
            l: l,
            complete: complete,
            error: error,
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
                    m('input.w-button.btn.btn-small[type="submit"][value="' + btnValue + '"]')
                ] : (!ctrl.error()) ? [
                    m('.w-form-done[style="display:block;"]', [
                        m('p', 'Requisição feita com sucesso.')
                    ])
                ] : [
                    m('.w-form-error[style="display:block;"]', [
                        m('p', 'Houve um problema na requisição.')
                    ])
                ])
            ]) : ''
        ]);
    }
}

export default adminExternalAction;
