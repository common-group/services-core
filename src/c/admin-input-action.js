window.c.AdminInputAction = (function(m, h, c){
  return {
    controller: function(args){
      var builder = args.data,
          key = builder.getKey,
          complete = m.prop(false),
          data = {},
          item = args.item,
          newValue = m.prop(''),
          isLoading = m.prop(false);

      builder.updateModel = builder.updateModel || builder.model

      var submit = function(){
        isLoading(true);
        m.redraw();
        h.idVM.id(item[builder.updateKey]);
        data[key] = newValue();
        builder.updateModel.patchWithToken(h.idVM.parameters(), data).then(function(data){
          item[key] = data[0][key];
          isLoading(false);
          complete(true);
        });
        return false;
      };

      var unload = function(el, isinit, context){
        context.onunload = function(){
          complete(false);
          newValue('');
        };
      };

      return {
        complete: complete,
        isLoading: isLoading,
        newValue: newValue,
        submit: submit,
        toggler: h.toggleProp(false, true),
        unload: unload
      };
    },
    view: function(ctrl, args){
      var data = args.data,
          btnValue = (ctrl.isLoading()) ? 'por favor, aguarde...' : data.callToAction;

      return m('.w-col.w-col-2',[
        m('button.btn.btn-small.btn-terciary', {
          onclick: ctrl.toggler.toggle
        }, data.outerLabel),
        (ctrl.toggler()) ?
          m('.dropdown-list.card.u-radius.dropdown-list-medium.zindex-10', {config: ctrl.unload},[
            m('form.w-form', {
              onsubmit: ctrl.submit
            }, (!ctrl.complete()) ? [
                  m('label', data.innerLabel),
                  m('input.w-input.text-field[type="text"][placeholder="' + data.placeholder + '"]', {onchange: m.withAttr('value', ctrl.newValue), value: ctrl.newValue()}),
                  m('input.w-button.btn.btn-small[type="submit"][value="' + btnValue + '"]')
                ] :
                [
                  m('.w-form-done', [
                    m('p', 'Apoio transferido com sucesso!')
                  ])
                ]
            )
          ])
        : ''
      ]);
    }
  };
}(window.m, window.c.h, window.c));
