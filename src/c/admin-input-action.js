window.c.AdminInputAction = (function(m, h, c){
  return {
    controller: function(args){
      var builder = args.data,
          complete = m.prop(false),
          data = {},
          error = m.prop(false),
          fail = m.prop(false),
          item = args.item,
          key = builder.getKey,
          l = m.prop(false),
          newValue = m.prop('');

      var returnData = function(res){
        item[key] = res[0][key];
        complete(true);
      };

      var showError = function(err){
        error(err);
        console.log(err.message);
      };

      var submit = function(){
        h.idVM.id(item[builder.updateKey]);
        data[key] = newValue();
        l = m.postgrest.loaderWithToken(builder.model.patchOptions(h.idVM.parameters(), data));
        l.load().then(returnData, showError);
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
        error: error,
        l: l,
        newValue: newValue,
        submit: submit,
        toggler: h.toggleProp(false, true),
        unload: unload
      };
    },
    view: function(ctrl, args){
      var data = args.data,
          btnValue = (ctrl.l()) ? 'por favor, aguarde...' : data.callToAction;

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
                ],
                (!ctrl.error())
            )
          ])
        : ''
      ]);
    }
  };
}(window.m, window.c.h, window.c));
