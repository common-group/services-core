window.c.AdminInputAction = (function(m, h, c) {
    return {
        controller: function(args) {
            var builder = args.data,
                complete = m.prop(false),
                error = m.prop(false),
                fail = m.prop(false),
                data = {},
                item = args.item,
                key = builder.property,
                forceValue = builder.forceValue || null,
                newValue = m.prop(forceValue);

            h.idVM.id(item[builder.updateKey]);

            var l = m.postgrest.loaderWithToken(builder.model.patchOptions(h.idVM.parameters(), data));

            var updateItem = function(res) {
                _.extend(item, res[0]);
                complete(true);
                error(false);
            };

            var submit = function() {
                data[key] = newValue();
                l.load().then(updateItem, function() {
                    complete(true);
                    error(true);
                });
                return false;
            };

            var unload = function(el, isinit, context) {
                context.onunload = function() {
                    complete(false);
                    error(false);
                    newValue(forceValue);
                };
            };

            return {
                complete: complete,
                error: error,
                l: l,
                newValue: newValue,
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
                        m('label', data.innerLabel), (data.forceValue === undefined) ?
                        m('input.w-input.text-field[type="text"][placeholder="' + data.placeholder + '"]', {
                            onchange: m.withAttr('value', ctrl.newValue),
                            value: ctrl.newValue()
                        }) : '',
                        m('input.w-button.btn.btn-small[type="submit"][value="' + btnValue + '"]')
                    ] : (!ctrl.error()) ? [
                        m('.w-form-done[style="display:block;"]', [
                            m('p', data.successMessage)
                        ])
                    ] : [
                        m('.w-form-error[style="display:block;"]', [
                            m('p', 'Houve um problema na requisição. ' + data.errorMessage)
                        ])
                    ])
                ]) : ''
            ]);
        }
    };
}(window.m, window.c.h, window.c));
