window.c.vms.home = ((I18n) => {
    return () => {
        const i18nStart = I18n.translations[I18n.currentLocale()].projects.home,
            banners = i18nStart.banners;

        return {
            banners: banners
        };
    };
}(window.I18n));
