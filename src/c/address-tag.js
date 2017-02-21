import m from 'mithril';
import _ from 'underscore';
import h from '../h';

const addressTag = {
    view(ctrl, args) {
        const project = args.project,
            address = project().address || {
                state_acronym: '',
                city: ''
            };

        return !_.isNull(address) ? m(`a.btn.btn-inline.btn-small.btn-transparent.link-hidden-light.u-marginbottom-10[href="/pt/explore?pg_search=${address.state_acronym}"]`, {
            onclick: h.analytics.event({
                cat: 'project_view',
                act: 'project_location_link',
                lbl: `${address.city} ${address.state_acronym}`,
                project: project()
            })
        }, [
            m('span.fa.fa-map-marker'), ` ${address.city}, ${address.state_acronym}`
        ]) : '';
    }
};

export default addressTag;
