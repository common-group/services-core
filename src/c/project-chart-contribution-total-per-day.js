window.c.ProjectChartContributionTotalPerDay = (function(m, Chart, models, _){
  return {
    controller: function(args) {
      var vm = m.postgrest.filtersVM({project_id: 'eq'}),
          resource = m.prop({}),
          mountDataset = function() {
            return [{
              label: 'My First dataset',
              fillColor: 'rgba(126,194,69,0.2)',
              strokeColor: 'rgba(126,194,69,1)',
              pointColor: 'rgba(126,194,69,1)',
              pointStrokeColor: '#fff',
              pointHighlightFill: '#fff',
              pointHighlightStroke: 'rgba(220,220,220,1)',
              data: _.map(resource().source, function(item) {return item.total;})
            }];
          },
          renderChart = function(element, isInitialized, context){
            if (isInitialized){return;}

            Object.defineProperty(element, 'offsetHeight', {
              get: function() { return element.height; },
            });
            Object.defineProperty(element, 'offsetWidth', {
              get: function() { return element.width; },
            });
            var ctx = element.getContext('2d');

            new Chart(ctx).Line({
              labels: _.map(resource().source, function(item) {return item.paid_at;}),
              datasets: mountDataset()
            });
          };

      vm.project_id(args.resourceId);

      models.projectContributionsPerDay.getRow(vm.parameters()).then(function(data){
        resource(data[0]);
      });

      return {
        vm: vm,
        resource: resource,
        renderChart: renderChart
      };
    },
    view: function(ctrl) {
      return m('canvas[id="chart"][width="400"][height="400"]', {config: ctrl.renderChart});
    }
  };
}(window.m, window.Chart, window.c.models, window._));
