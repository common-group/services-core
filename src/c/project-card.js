import m from 'mithril';
import I18n from 'i18n-js';
import _ from 'underscore';
import h from '../h';
import models from '../models';

const I18nScope = _.partial(h.i18nScope, 'projects.card');
const projectCard = {
    view(ctrl, args) {
        const project = args.project,
            progress = project.progress.toFixed(2),
            remainingTextObj = h.translatedTime(project.remaining_time),
            elapsedTextObj = h.translatedTime(project.elapsed_time),
            link = '/' + project.permalink + (args.ref ? '?ref=' + args.ref : ''),
            type = args.type || 'small',
            css = (cardType) => {
                const cssClasses = {
                    'small': {
                        wrapper: '.w-col.w-col-4',
                        innerWrapper: '.card-project.card.u-radius',
                        thumb: '.card-project-thumb',
                        descriptionWrapper: '',
                        description: '.card-project-description.alt',
                        title: '.fontweight-semibold.u-text-center-small-only.lineheight-tight.u-marginbottom-10.fontsize-base',
                        author: '.w-hidden-small.w-hidden-tiny.fontsize-smallest.fontcolor-secondary.u-marginbottom-20',
                        headline: '.w-hidden-small.w-hidden-tiny.fontcolor-secondary.fontsize-smaller',
                        city: '.w-hidden-small.w-hidden-tiny.card-project-author.altt'
                    },
                    'medium': {
                        wrapper: '.w-col.w-col-6',
                        innerWrapper: '.card-project.card.u-radius',
                        thumb: '.card-project-thumb.medium',
                        descriptionWrapper: '',
                        description: '.card-project-description.alt',
                        title: '.fontsize-large.fontweight-semibold.u-marginbottom-10',
                        author: '.w-hidden-small.w-hidden-tiny.fontsize-smallest.fontcolor-secondary.u-marginbottom-20',
                        headline: '.w-hidden-small.w-hidden-tiny.fontcolor-secondary.fontsize-smaller',
                        city: '.w-hidden-small.w-hidden-tiny.card-project-author.altt'
                    },
                    'big': {
                        wrapper: '.card.u-radius.card-project',
                        innerWrapper: '.w-row',
                        thumb: '.w-col.w-col-8.w-col-medium-6.card-project-thumb.big',
                        descriptionWrapper: '.w-col.w-col-4.w-col-medium-6',
                        description: '.card-project-description.big',
                        title: '.fontsize-large.fontweight-semibold.u-marginbottom-10',
                        author: '.fontsize-smallest.fontcolor-secondary.u-marginbottom-20',
                        headline: '.fontcolor-secondary.fontsize-smaller',
                        city: '.w-hidden'
                    }
                };

                return cssClasses[cardType];
            };

        return m(css(type).wrapper, [
            m(css(type).innerWrapper, [
                m(`a${css(type).thumb}[href="${link}"]`, {
                    style: {
                        'background-image': `url(${project.project_img})`,
                        'display': 'block'
                    }
                }),
                m(css(type).descriptionWrapper, [
                    m(css(type).description, [
                        m(css(type).title, [
                            m(`a.link-hidden[href="${link}"]`, project.project_name)
                        ]),
                        m(css(type).author, `${I18n.t('by', I18nScope())} ${project.owner_name}`),
                        m(css(type).headline, [
                            m(`a.link-hidden[href="${link}"]`, project.headline)
                        ])
                    ]),
                    m(css(type).city, [
                        m('.fontsize-smallest.fontcolor-secondary', [m('span.fa.fa-map-marker.fa-1', ' '), ` ${project.city_name ? project.city_name : ''}, ${project.state_acronym ? project.state_acronym : ''}`])
                    ]),
                    m(`.card-project-meter.${project.state}`, [
                        (_.contains(['successful', 'failed', 'waiting_funds'], project.state)) ?
                            m('div', I18n.t('display_status.' + project.state, I18nScope())) :
                        m('.meter', [
                            m('.meter-fill', {
                                style: {
                                    width: `${(progress > 100 ? 100 : progress)}%`
                                }
                            })
                        ])
                    ]),
                    m('.card-project-stats', [
                        m('.w-row', [
                            m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4', [
                                m('.fontsize-base.fontweight-semibold', `${Math.ceil(project.progress)}%`)
                            ]),
                            m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.u-text-center-small-only', [
                                m('.fontsize-smaller.fontweight-semibold', `R$ ${h.formatNumber(project.pledged)}`),
                                m('.fontsize-smallest.lineheight-tightest', 'Levantados')
                            ]),
                            m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.u-text-right', project.expires_at ? [
                                m('.fontsize-smaller.fontweight-semibold', `${remainingTextObj.total} ${remainingTextObj.unit}`),
                                m('.fontsize-smallest.lineheight-tightest', (remainingTextObj.total > 1) ? 'Restantes' : 'Restante')
                            ] : [
                                m('.fontsize-smallest.lineheight-tight', ['Iniciado há',m('br'),`${elapsedTextObj.total} ${elapsedTextObj.unit}`])
                            ])
                        ])
                    ])
                ])
            ])
        ]);
    }
};

export default projectCard;
