adminApp.filterDropdown = {
  view: function(ctrl, args){
    return m('.w-col.w-col-3.w-col-small-6', [
      m('label.fontsize-smaller[for="'+args.name+'"]', args.label),
      m('select.w-select.text-field.positive[name="'+args.name+'"]', {
        onchange: m.withAttr('value', args.vm),
        value: args.vm()
      },[
          _.map(args.dataset, function(data){
            return m('option[value="'+data.value+'"]', data.option);
          })
      ])
    ]);
  }
};
