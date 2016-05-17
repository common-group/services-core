import m from 'mithril';
import _ from 'underscore';
import h from '../h';

const adminRadioAction = {
    controller(args) {
        const builder = args.data,
            complete = m.prop(false),
            data = {},
            error = m.prop(false),
            fail = m.prop(false),
            item = args.item(),
            description = m.prop(item.description || ''),
            key = builder.getKey,
            newID = m.prop(''),
            getFilter = {},
            setFilter = {},
            radios = m.prop(),
            getAttr = builder.radios,
            getKey = builder.getKey,
            getKeyValue = args.getKeyValue,
            updateKey = builder.updateKey,
            updateKeyValue = args.updateKeyValue,
            validate = builder.validate,
            selectedItem = builder.selectedItem || m.prop();

        setFilter[updateKey] = 'eq';
        const setVM = postgrest.filtersVM(setFilter);
        setVM[updateKey](updateKeyValue);

        getFilter[getKey] = 'eq';
        const getVM = postgrest.filtersVM(getFilter);
        getVM[getKey](getKeyValue);

        const getLoader = postgrest.loaderWithToken(builder.getModel.getPageOptions(getVM.parameters()));

        const setLoader = postgrest.loaderWithToken(builder.updateModel.patchOptions(setVM.parameters(), data));

        const updateItem = (data) => {
            if (data.length > 0) {
                const newItem = _.findWhere(radios(), {
                    id: data[0][builder.selectKey]
                });
                selectedItem(newItem);
            } else {
                error({
                    message: 'Nenhum item atualizado'
                });
            }
            complete(true);
        };

        const fetch = () => {
            getLoader.load().then(radios, error);
        };

        const submit = () => {
            if (newID()) {
                let validation = validate(radios(), newID());
                if (_.isUndefined(validation)) {
                    data[builder.selectKey] = newID();
                    setLoader.load().then(updateItem, error);
                } else {
                    complete(true);
                    error({
                        message: validation
                    });
                }
            }
            return false;
        };

        const unload = (el, isinit, context) => {
            context.onunload = () => {
                complete(false);
                error(false);
                newID('');
            };
        };

        const setDescription = (text) => {
            description(text);
            m.redraw();
        };

        fetch();

        return {
            complete: complete,
            description: description,
            setDescription: setDescription,
            error: error,
            setLoader: setLoader,
            getLoader: getLoader,
            newID: newID,
            submit: submit,
            toggler: h.toggleProp(false, true),
            unload: unload,
            radios: radios
        };
    },
    view(ctrl, args) {
        const data = args.data,
            item = args.item(),
            btnValue = (ctrl.setLoader() || ctrl.getLoader()) ? 'por favor, aguarde...' : data.callToAction;

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
                    (ctrl.radios()) ?
                    _.map(ctrl.radios(), (radio, index) => {
                        const set = () => {
                            ctrl.newID(radio.id);
                            ctrl.setDescription(radio.description);
                        };
                        const selected = (radio.id === (item[data.selectKey] || item.id)) ? true : false;

                        return m('.w-radio', [
                            m('input#r-' + index + '.w-radio-input[type=radio][name="admin-radio"][value="' + radio.id + '"]' + ((selected) ? '[checked]' : ''), {
                                onclick: set
                            }),
                            m('label.w-form-label[for="r-' + index + '"]', 'R$' + radio.minimum_value)
                        ]);
                    }) : h.loader(),
                    m('strong', 'Descrição'),
                    m('p', ctrl.description()),
                    m('input.w-button.btn.btn-small[type="submit"][value="' + btnValue + '"]')
                ] : (!ctrl.error()) ? [
                    m('.w-form-done[style="display:block;"]', [
                        m('p', 'Recompensa alterada com sucesso!')
                    ])
                ] : [
                    m('.w-form-error[style="display:block;"]', [
                        m('p', ctrl.error().message)
                    ])
                ])
            ]) : ''
        ]);
    }
};

export default adminRadioAction;
