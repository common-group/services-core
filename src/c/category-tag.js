import m from 'mithril';
import h from '../h';

const categoryTag = {
    view: function(ctrl, args) {
        const project = args.project;

        return project ? m(`a.btn.btn-inline.btn-small.btn-transparent.link-hidden-light${args.isDark ? '.fontcolor-negative' : ''}[href="/pt/explore#by_category_id/${project().category_id}"]`, {
            onclick: h.analytics.event({
                cat: 'project_view',
                act: 'project_category_link',
                lbl: project().category_name,
                project: project()
            })
        }, [
            m('span.fa.fa-tag'), ' ',
            project().category_name
        ]) : '';
    }
};

export default categoryTag;
