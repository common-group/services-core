/**
 * window.c.ProjectSuccessfulOnboardStart component
 * render congratulations message when project is successful and
 * button to confirm the bank data
 *
 * Example:
 * m.component(c.ProjectSuccessfulOnboardStart, {
 *     projectTransfer: projectTransfer,
 *     setStage: setStage // setStage is defined on ProjectSuccessfulOnboard component
 * })
 **/

window.c.DashboardInformation = ((m, c, h) => {
    return {
        view: (ctrl, args) => {
            const content = args.content;

            return m('.w-container', [
                m('.w-row.u-marginbottom-40', [
                    m('.w-col.w-col-6.w-col-push-3', [
                        m('.u-text-center', [
                            m('img.u-marginbottom-20', {src: content.icon, width: 94}),
                            m('.fontsize-large.fontweight-semibold.u-marginbottom-20', content.title),
                            m('.fontsize-base.u-marginbottom-30', m.trust(content.text)),
                            content.cta ? m('a.btn.btn-large.btn-inline', {href: content.href, onclick: args.nextStage()}, content.cta) : ''
                        ])
                    ])
                ])
            ]);
        }
    };
}(window.m, window.c, window.c.h));
