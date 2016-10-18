import m from 'mithril';
import _ from 'underscore';
import h from '../h';

const blogBanner = {
    controller(args) {
        const posts = h.getBlogPosts();

        return {posts: posts};
    },
    view(ctrl, args) {

        return m('section.section-large.bg-gray.before-footer[id=\'blog\']',
            m('.w-container',
                [
                    m('.u-text-center',
                        [
                            m('a[href=\'http://blog.catarse.me\'][target=\'blank\']',
                                m('img.u-marginbottom-10[alt=\'Icon blog\'][src=\'/assets/icon-blog.png\']')
                            ),
                            m('.fontsize-large.u-marginbottom-60.text-success',
                                m('a.link-hidden-success[href=\'http://blog.catarse.me\'][target=\'__blank\']',
                                    'Blog do Catarse'
                                )
                            )
                        ]
                    ),
                    m('.w-row', _.map(ctrl.posts, (post) => {
                        return m('.w-col.w-col-4.col-blog-post',
                            [
                                m(`a.link-hidden.fontweight-semibold.fontsize-base.u-marginbottom-10[href="${post[1][1]}"][target=\'__blank\']`, post[0][1]),
                                m('.fontsize-smaller.fontcolor-secondary.u-margintop-10', m.trust(`${h.strip(post[6][1].substr(0, 130))}...`))
                            ]
                        );
                    }))
                ]
            )
        );
    }
};

export default blogBanner;
