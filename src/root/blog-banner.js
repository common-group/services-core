import m from 'mithril';

const blogBanner = {
    controller(args) {

    },
    view(ctrl, args) {
        return m("section.section-large.bg-gray.before-footer[id='blog']",
            m(".w-container",
                [
                    m(".u-text-center",
                        [
                            m("a[href='http://blog.catarse.me'][target='blank']",
                                m("img.u-marginbottom-10[alt='Icon blog'][src='/assets/icon-blog.png']")
                            ),
                            m(".fontsize-large.u-marginbottom-60.text-success",
                                m("a.link-hidden-success[href='http://blog.catarse.me'][target='__blank']",
                                    "Blog do Catarse"
                                )
                            )
                        ]
                    ),
                    m(".w-row",
                        [
                            m(".w-col.w-col-4.col-blog-post",
                                [
                                    m("a.link-hidden.fontweight-semibold.fontsize-base.u-marginbottom-10[href='http://blog.catarse.me/dia-da-toalha/'][target='__blank']"),
                                    m(".fontsize-smaller.fontcolor-secondary.u-margintop-10")
                                ]
                            ),
                            m(".w-col.w-col-4.col-blog-post",
                                [
                                    m("a.link-hidden.fontweight-semibold.fontsize-base.u-marginbottom-10[href='http://blog.catarse.me/crowdfunding-para-sua-avo/'][target='__blank']"),
                                    m(".fontsize-smaller.fontcolor-secondary.u-margintop-10")
                                ]
                            ),
                            m(".w-col.w-col-4.col-blog-post",
                                [
                                    m("a.link-hidden.fontweight-semibold.fontsize-base.u-marginbottom-10[href='http://blog.catarse.me/rebeca-prado/'][target='__blank']"),
                                    m(".fontsize-smaller.fontcolor-secondary.u-margintop-10")
                                ]
                            )
                        ]
                    )
                ]
            )
        );
    }
};

export default blogBanner;
