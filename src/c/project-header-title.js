import m from 'mithril';
import _ from 'underscore';
import userVM from '../vms/user-vm';
import h from '../h';

const projectHeaderTitle = {
    view(ctrl, args) {
        const project = args.project;

        return !_.isUndefined(project()) ? m('.w-section.page-header.u-text-center', [
            m('.w-container', [
                m('h1.fontsize-larger.fontweight-semibold.project-name[itemprop="name"]', h.selfOrEmpty(project().name || project().project_name)),
                m('h2.fontsize-base.lineheight-looser[itemprop="author"]', [
                    'por ',
                    project().user ? userVM.displayName(project().user) : project().owner_public_name ? project().owner_name : ''
                ]),
                args.children
            ])
        ]) : m('div', '');
    }
};

export default projectHeaderTitle;
