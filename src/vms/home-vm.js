const homeVM = () => {
    const i18nStart = window.I18n.translations[I18n.currentLocale()].projects.home,
        banners = i18nStart.banners;

    return {
        banners
    };
};

export default homeVM;
