/**
 * window.c.DashboardInfo component
 * render a row of information with an icon and an optional call to action
 *
 * Example:
 * m.component(c.DashboardInfo, {
 *      content: {
 *          icon: 'url://to.icon',
 *          title: 'title',
 *          href: '#where-to',
 *          cta: 'next step'
 *      }
 * })
 **/
import m from 'mithril';
import _ from 'underscore';

const dashboardInfo = {
    controller(args) {
        const toRedraw = args.dataToRedraw || {},
              listenToReplace = (element, isInitialized, context) => {

                  if (isInitialized) return;

                  _.map(element.children, function(item) {
                      let toR = toRedraw[item.getAttribute('id')];

                      if (toR) {
                          item[toR.action] = toR.actionSource;
                      }
                  });
              };

        return {
            listenToReplace: listenToReplace
        };
    },
    view(ctrl, args) {
        const content = args.content;

        return m('.w-container', [
            m('.w-row.u-marginbottom-40', [
                m('.w-col.w-col-6.w-col-push-3', [
                    m('.u-text-center', [
                        m('img.u-marginbottom-20', {src: content.icon, width: 94}),
                        m('.fontsize-large.fontweight-semibold.u-marginbottom-20', content.title),
                        m('.fontsize-base.u-marginbottom-30', {config: ctrl.listenToReplace}, m.trust(content.text)),
                        content.cta ? m('a.btn.btn-large.btn-inline', {href: content.href, onclick: args.nextStage}, content.cta) : ''
                    ])
                ])
            ])
        ]);
    }
};

export default dashboardInfo;
