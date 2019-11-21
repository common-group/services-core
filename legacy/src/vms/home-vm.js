import m from 'mithril';
import h from '../h';

/**
 * @typedef {Object} HomeBanner
 * @property {number} id
 * @property {string} title
 * @property {string} subtitle
 * @property {string} link
 * @property {string} cta
 * @property {string} image
 * @property {string} created_at
 * @property {string} updated_at
 */

const homeVM = () => {
    const i18nStart = window.I18n.translations[window.I18n.currentLocale()].projects.home || { banners : [] },
        banners = i18nStart.banners;

    function updateBanners() {

    }

    const _isUpdating = h.RedrawStream(false);
    const _banners =  h.RedrawStream([]);

    function getBanners() {
        m
            .request('/home_banners')
            .then(_banners)
            .catch(() => _banners([]));
    }

    /** @param {Array<HomeBanner>} newBanners */
    async function updateBanners(newBanners) {

        try {
            for await (const newBannerData of newBanners) {
                await m.request({
                    put: `/home_banners/${newBannerData.id}/`,
                    data: newBannerData,
                    config: h.setCsrfToken
                });
            }
        } catch(e) {

        }
    }

    getBanners();

    
    return {
        /** @type {Array<HomeBanner>} */
        get banners() {
            return _banners();
        },

        /** @param {Array<HomeBanner>} newBanners */
        set banner(newBanners) {
            updateBanners(newBanners);
        },

        get isUpdating() {
            return _isUpdating()
        }
    };
};

export default homeVM;