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

window.c.ProjectSuccessfulOnboardStart = ((m, c, h) => {
    const I18nScope = _.partial(h.i18nScope, 'projects.successful_onboard.start');

    return {
        view: (ctrl, args) => {
            const projectTransfer = args.projectTransfer;

            return m('.w-container', [
                m('.w-row.u-marginbottom-40', [
                    m('.w-col.w-col-6.w-col-push-3', [
                        m('.u-text-center', [
                            m('img.u-marginbottom-20', {src: I18n.t('icon', I18nScope()), width: 94}),
                            m('.fontsize-large.fontweight-semibold.u-marginbottom-20',I18n.t('title', I18nScope())),
                            m('.fontsize-base.u-marginbottom-30', m.trust(I18n.t('text', I18nScope({total_amount: h.formatNumber(projectTransfer.total_amount, 2)})))),
                            m('a.btn.btn-large.btn-inline', {href: '#start_successful', onclick: args.setStage('confirm_account')}, I18n.t('cta', I18nScope()))
                        ])
                    ])
                ])
            ]);
        }
    };
}(window.m, window.c, window.c.h));
