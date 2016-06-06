import m from 'mithril';
import _ from 'underscore';
import h from '../h';
import projectShareBox from './project-share-box';

const projectHighlight = {
    controller() {
        return {
            displayShareBox: h.toggleProp(false, true)
        };
    },
    view(ctrl, args) {
        const project = args.project,
            address = project().address || {state_acronym: '', city: ''};

        return m('#project-highlight', [
            (project().video_embed_url ? m('.w-embed.w-video.project-video', {
                style: 'min-height: 240px;'
            }, [
                m('iframe.embedly-embed[itemprop="video"][src="' + project().video_embed_url + '"][frameborder="0"][allowFullScreen]')
            ]) : m('.project-image', {
                style: 'background-image:url(' + project().original_image + ');'
            })),
            m('.project-blurb', project().headline),
            m('.u-text-center-small-only.u-marginbottom-30', [
                (!_.isNull(address) ?
                 m(`a.btn.btn-inline.btn-small.btn-transparent.link-hidden-light.u-marginbottom-10[href="/pt/explore?pg_search=${address.state_acronym}"]`, {
                     onclick: h.analytics.event({cat: 'project_view',act: 'project_location_link',lbl: address.city + ' ' + address.state_acronym,project: project()})
                 }, [
                        m('span.fa.fa-map-marker'), ` ${address.city}, ${address.state_acronym}`
                    ]) : ''
                ),
                m(`a.btn.btn-inline.btn-small.btn-transparent.link-hidden-light[href="/pt/explore#by_category_id/${project().category_id}"]`, {
                    onclick: h.analytics.event({cat: 'project_view',act: 'project_category_link',lbl: project().category_name,project: project()})
                }, [
                    m('span.fa.fa-tag'), ' ',
                    project().category_name
                ]),
                m('button#share-box.btn.btn-small.btn-terciary.btn-inline', {
                    onclick: ctrl.displayShareBox.toggle
                }, 'Compartilhar'), (ctrl.displayShareBox() ? m.component(projectShareBox, {
                    project: project,
                    displayShareBox: ctrl.displayShareBox
                }) : '')
            ])
        ]);
    }
};

export default projectHighlight;
