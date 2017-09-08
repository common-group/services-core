import m from 'mithril';
import _ from 'underscore';
import I18n from 'i18n-js';
import h from '../h';

const I18nScope = _.partial(h.i18nScope, 'projects.card');
const progressMeter = {
    controller(args) {
        const project = args.project;
        const progress = args.progress;
        const isFinished = project => _.contains(['successful', 'failed', 'waiting_funds'], project.state);
        const cardMeter = () => {
            const failed = () => ((project.state === 'failed') || (project.state === 'waiting_funds')) ? 'card-secondary' : '';

            return `.card-project-meter.${project.mode}.${project.state}.${progress > 100 ? 'complete' : 'incomplete'}.${failed()}`;
        };
        return {
            project,
            progress,
            cardMeter,
            isFinished
        };
    },
    view(ctrl) {
        const project = ctrl.project;
        return m(ctrl.cardMeter(), [
            (ctrl.isFinished(project)) ?
            m('div',
                project.state === 'successful' && ctrl.progress < 100 ? I18n.t('display_status.flex_successful', I18nScope()) : I18n.t(`display_status.${project.state}`, I18nScope())
            ) :
            m('.meter', [
                m('.meter-fill', {
                    style: {
                        width: `${(ctrl.progress > 100 ? 100 : ctrl.progress)}%`
                    }
                })
            ])
        ]);
    }
};

export default progressMeter;
