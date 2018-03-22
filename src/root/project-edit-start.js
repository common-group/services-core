import m from 'mithril';
import h from '../h';
import userVM from '../vms/user-vm';
import projectVM from '../vms/project-vm';
import youtubeLightbox from '../c/youtube-lightbox';

const I18nScope = _.partial(h.i18nScope, 'projects.dashboard_start');
const projectEditStart = {
    controller(args) {
    },

    view(ctrl, args) {
        return m('.dashboard-header.min-height-70.u-text-center',
            m('.w-container',
                m('.u-marginbottom-40.w-row',
                    [
                        m('.w-col.w-col-8.w-col-push-2',
                            [
                                m('.fontsize-larger.fontweight-semibold.lineheight-looser.u-marginbottom-10',
                                    I18n.t('title', I18nScope())
                                ),
                                m('.fontsize-small.lineheight-loose.u-marginbottom-40',
                                    I18n.t('description', I18nScope({ name: args.project().user.name || '' }))
                                ),
                                m('.card.card-terciary.u-radius',
                                    m(`iframe[allowfullscreen="true"][width="630"][height="383"][frameborder="0"][scrolling="no"][mozallowfullscreen="true"][webkitallowfullscreen="true"][src=${I18n.t('video_src', I18nScope())}]`)
                                )
                            ]
                        )
                    ]
                )
            )
        );
    }
};

export default projectEditStart;
