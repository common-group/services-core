adminApp.AdminFilter = {
  controller: function() {
    this.toggler = h.toggleProp(false, true);
  },
  view: function(ctrl, args) {
    var formBuilder = function(data) {
      return {
        'main': m.component(adminApp.filterMain, data),
        'dropdown': m.component(adminApp.filterDropdown, data),
        'numberRange': m.component(adminApp.filterNumberRange, data),
        'dateRange': m.component(adminApp.filterDateRange, data)
      };
    };
    var main = _.findWhere(args.form, {type: 'main'});

    return m('#admin-contributions-filter.w-section.page-header', [
      m('.w-container', [
        m('.fontsize-larger.u-text-center.u-marginbottom-30', 'Apoios'),
        m('.w-form', [
          m('form', {
            onsubmit: args.submit
          }, [
            formBuilder(main.data).main,
            m('.u-marginbottom-20.w-row',
              m('button.w-col.w-col-12.fontsize-smallest.link-hidden-light[type="button"][style="background: none; border: none; outline: none; text-align: left;"]', {
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
