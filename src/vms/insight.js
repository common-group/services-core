window.c.vms.insight = ((I18n) => {
    const content = (state) => {
        return I18n.translations[I18n.currentLocale()].projects.successful_onboard[state];
    };

    return {
        content: content
    };
}(window.I18n));
