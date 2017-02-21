import m from 'mithril';
import _ from 'underscore';
import h from '../h';
import projectShareBox from './project-share-box';
import facebookButton from './facebook-button';
import addressTag from './address-tag';
import categoryTag from './category-tag';

const projectHighlight = {
    controller() {
        return {
            displayShareBox: h.toggleProp(false, true)
        };
    },
    view(ctrl, args) {
        const project = args.project;

        return m('#project-highlight', [
            (project().video_embed_url ? m('.w-embed.w-video.project-video', {
                style: 'min-height: 240px;'
            }, [
                m(`iframe.embedly-embed[itemprop="video"][src="${project().video_embed_url}"][frameborder="0"][allowFullScreen]`)
            ]) : m('.project-image', {
                style: `background-image:url('${project().original_image || project().project_img}');`
            })),
            m('.w-hidden-small.w-hidden-tiny', [
                m.component(addressTag, { project }),
                m.component(categoryTag, { project })
            ]),
            m('.project-blurb', project().headline),
            m('.project-share.w-hidden-small.w-hidden-tiny',
                m('.u-marginbottom-30.u-text-center-small-only', [
                    m('.w-inline-block.fontcolor-secondary.fontsize-smaller.u-marginright-20',
                        'Compartilhar:'
                    ),
                    project().permalink ? m.component(facebookButton, {
                        url: `https://www.catarse.me/${project().permalink}?ref=facebook&utm_source=facebook.com&utm_medium=social&utm_campaign=project_share`
                    }) : '',
                    project().permalink ? m.component(facebookButton, {
                        messenger: true,
                        url: `https://www.catarse.me/${project().permalink}?ref=facebook&utm_source=facebook.com&utm_medium=messenger&utm_campaign=project_share`
                    }) : '',
                    m('button#more-share.btn.btn-inline.btn-medium.btn-terciary', {
                        style: {
                            transition: 'all 0.5s ease 0s'
                        },
                        onclick: ctrl.displayShareBox.toggle
                    }, [
                        '···',
                        ' Mais'
                    ]),
                    (ctrl.displayShareBox() ? m(projectShareBox, {
                        project,
                        displayShareBox: ctrl.displayShareBox
                    }) : '')
                ])
            )
        ]);
    }
};

export default projectHighlight;
