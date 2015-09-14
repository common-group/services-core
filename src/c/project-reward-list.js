window.c.ProjectRewardList = (function(m, h, models, _){
  return {
    controller: function(args) {
      var listVM = m.postgrest.paginationVM(models.rewardDetail.getPage),
          filterVM = m.postgrest.filtersVM({project_id: 'eq'}),
          rewardDetails = m.prop([]);

      filterVM.project_id(args.project.id);

      //FIXME: row_order rank
      listVM.firstPage(filterVM.parameters()).then(rewardDetails);

      return {
        rewardDetails: rewardDetails
      };
    },

    view: function(ctrl, args) {
      //FIXME: MISSING ADJUSTS
      // - hover effect
      // - card-gone when reward.sold_out?
      // - max contributions limit overview
      // - add draft admin modifications
      var project = args.project;
      return m('#rewards.u-marginbottom-30', _.map(ctrl.rewardDetails(), function(reward) {
        var contributionUrlWithReward = '/projects/' + project.id + '/contributions/new?reward_id=' + reward.id;

        return m('a.card-reward.card.card-secondary.u-marginbottom-10[href="' + (project.open_for_contributions ? contributionUrlWithReward : 'js:void(0);') + '"]', [
          m('.u-marginbottom-20', [
            m('.fontsize-base.fontweight-semibold', 'Para R$ ' + h.formatNumber(reward.minimum_value) + ' ou mais'),
            m('.fontsize-smaller.fontweight-semibold', h.pluralize(reward.paid_count, ' apoiador', ' apoiadores')),
            m('.fontsize-smaller', m.trust(h.simpleFormat(reward.description)))
          ])
        ]);
      }));
    }
  };
}(window.m, window.c.h, window.c.models, window._));
