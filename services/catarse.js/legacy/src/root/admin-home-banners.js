import m from 'mithril';
import homeVM, { HomeBanner } from '../vms/home-vm';
import { AdminHomeBannersEntry } from '../c/admin-home-banners-entry';

const AdminHomeBanners = {
    oninit(vnode) {
        const bannerEntries = [1, 2, 3, 4, 5, 6, 7, 8];

        const vm = homeVM();

        vnode.state = {
            banners: vm.banners
        };
    },

    view({ state, attrs }) {

        /** @type {Array<HomeBanner>} */
        const banners = state.banners;

        return m('div.section.bg-gray.before-footer',
            m('div.w-container', [




                m('div.save-draft-btn-section.w-row', [
                    m('div.w-col.w-col-4'),
                    m('div.w-col.w-col-4', m('a.btn.btn-large[href="#"]', 'Salvar')),
                    m('div.w-col.w-col-4')
                ])
            ])
        )
    }
};

export default AdminHomeBanners;