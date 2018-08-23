import m from 'mithril';

const projectEditTab = {
    view: function(ctrl, args) {
        return m('div.u-marginbottom-80', [
            m(".w-section.dashboard-header.u-text-center[id='dashboard-titles-root']",
              m('.w-container',
                m('.w-row',
                  m('.w-col.w-col-8.w-col-push-2.u-marginbottom-30', [
                      m(".fontweight-semibold.fontsize-larger.lineheight-looser[id='dashboard-page-title']",
                        m.trust(args.title)
                       ),
                      m(".fontsize-base[id='dashboard-page-subtitle']",
                        m.trust(args.subtitle)
                       )
                  ])
                 )
               ),
             ),
            m('.u-marginbottom-80', args.content)
        ]);
    }
};

export default projectEditTab;
