import I18n from 'i18n-js';

const homeVM = I18n => {
    return () => {
        const i18nStart = I18n.translations[I18n.currentLocale()].projects.home,
            banners = i18nStart.banners;

        return {
            banners: banners
        };
    };
};

export default homeVM;
