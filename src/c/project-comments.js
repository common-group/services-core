import m from 'mithril';
import h from '../h';

const projectComments = {
    controller() {
        const loadComments = (el, isInitialized) => {
            return (el, isInitialized) => {
                if (isInitialized) {return;}
                h.fbParse();
            };
        };

        return {loadComments: loadComments};
    },
    view(ctrl, args) {
        const project = args.project();
        return m('.fb-comments[data-href="http://www.catarse.me/' + project.permalink + '"][data-num-posts=50][data-width="610"]', {config: ctrl.loadComments()});
    }
};

export default projectComments;
