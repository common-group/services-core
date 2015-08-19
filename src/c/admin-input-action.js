window.c.AdminInputAction = (function(m, h, c){
  return {
    controller: function(args){
      var builder = args.data,
          data = {},
          item = args.item,
          newValue = m.prop('');

      var submit = function(){
        h.idVM.id(item[builder.updateKey]);
        data[builder.getKey] = newValue();
        builder.model.patchWithToken(h.idVM.parameters(), data);
        return false;
      };

      return {
        newValue: newValue,
        toggler: h.toggleProp(false, true),
        submit: submit
      };
    },
    view: function(ctrl, args){
      var data = args.data;
      return m('.w-col.w-col-2',[
        m('button.btn.btn-small.btn-terciary', {
          onclick: ctrl.toggler.toggle
        }, data.outerLabel),
        (ctrl.toggler()) ?
          m('.dropdown-list.card.u-radius.dropdown-list-medium.zindex-10', [
            m('form.w-form', {
              onsubmit: ctrl.submit
            }, [
                m('label', data.innerLabel),
                m('input.w-input.text-field[type="text"][placeholder="' + data.placeholder + '"]', {onchange: m.withAttr('value', ctrl.newValue), value: ctrl.newValue()}),
                m('input.w-button.btn.btn-small[type="submit"][value="' + data.callToAction + '"]')
            ])
          ])
        : ''
      ]);
    }
  };
}(window.m, window.c.h, window.c));
