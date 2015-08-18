window.c.AdminInputAction = (function(m, h, c){
  return {
    controller: function(args){
      var submit = function(){
        console.log('submit');
      };
      return {
        toggler: h.toggleProp(false, true),
        submit: submit
      };
    },
    view: function(ctrl, args){
      var action = args.data;
      return m('.w-col.w-col-2',[
        m('button.btn.btn-small.btn-terciary', {
          onclick: ctrl.toggler.toggle
        }, action.outerLabel),
        (ctrl.toggler()) ?
          m('form.dropdown-list.card.u-radius.dropdown-list-medium.zindex-10', [
            m('form.w-form', {
              onsubmit: ctrl.submit
            }, [
                m('label', action.innerLabel),
                m('input.w-input.text-field[type="text"][placeholder="' + action.placeholder + '"]',{onchange: m.withAttr('value', action.model[action.property]), value: action.model[action.property]}),
                m('input.w-button.btn.btn-small[type="submit"][value="' + action.callToAction + '"]')
            ])
          ])
        : ''
      ]);
    }
  };
}(window.m, window.c.h, window.c));
