window.c.AdminProjectDetailsExplanation = (function(m){
  return {
    controller: function(args) {
      var explanation = function(resource) {
        switch (resource.state) {
          case 'online':
            return m('span', 'projeto online');
          case 'successful':
            return m('span', 'projeto successful');
          case 'waiting_funds':
            return m('span', 'projeto waiting_funds');
          case 'rejected':
            return m('span', 'projeto rejected');
          case 'draft':
            return m('span', 'projeto draft');
          case 'in_analysis':
            return m('span', 'projeto in_analysis');
        }
      };

      return {
        explanation: explanation(args.resource)
      };
    },
    view: function(ctrl) {
      return m('p.fontsize-base', ctrl.explanation);
    }
  };
}(window.m));
