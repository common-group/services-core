window.c.AdminFilter = (function(c, m, _, h){
  return {
    controller: function(){
      return {
        toggler: h.toggleProp(false, true)
      };
    },
    view: function(ctrl, args){
      var formBuilder = function(data){
        return {
          'main': m.component(c.FilterMain, data),
          'dropdown': m.component(c.FilterDropdown, data),
          'numberRange': m.component(c.FilterNumberRange, data),
          'dateRange': m.component(c.FilterDateRange, data)
        };
      }, main = _.findWhere(args.form, {type: 'main'});

      return m('#admin-contributions-filter.w-section.page-header', [
        m('.w-container', [
          m('.fontsize-larger.u-text-center.u-marginbottom-30', 'Apoios'),
          m('.w-form', [
            m('form', {
              onsubmit: args.submit
            }, [
              formBuilder(main.data).main,
              m('.u-marginbottom-20.w-row',
                m('button.w-col.w-col-12.fontsize-smallest.link-hidden-light[style="background: none; border: none; outline: none; text-align: left;"][type="button"]', {
                  onclick: ctrl.toggler.toggle
                }, 'Filtros avançados  >')), (ctrl.toggler() ?
                m('#advanced-search.w-row.admin-filters', [
                  _.map(args.form, function(f){
                    return (f.type !== 'main') ? formBuilder(f.data)[f.type] : '';
                  })
                ]) : ''
              )
            ])
          ])
        ])
      ]);
    }
  };
}(window.c, window.m, window._, window.c.h));
