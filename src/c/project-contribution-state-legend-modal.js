import m from 'mithril';
import h from '../h';

const ProjectContributionStateLegendModal = {
    view(ctrl, args) {
        return m('div', [
            m('.modal-dialog-header', [
                m('.fontsize-large.u-text-center',
                  'Status do apoio')
            ]),
        ]);
    }
};

export default ProjectContributionStateLegendModal;
