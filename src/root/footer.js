import m from 'mithril';

const footer = {
    view() {
        return m("footer.main-footer.main-footer-neg",
            [
                m("section.w-container",
                    m(".w-row",
                        [
                            m(".w-col.w-col-9",
                                m(".w-row",
                                    [
                                        m(".w-col.w-col-4.w-col-small-4.w-col-tiny-4.w-hidden-tiny",
                                            [
                                                m(".footer-full-signature-text.fontsize-small",
                                                    "Bem-vindo"
                                                ),
                                                m("a.link-footer[href='https://www.catarse.me/pt/flex']",
                                                    [
                                                        "Catarse flex",
                                                        m.trust("&nbsp;"),
                                                        m("span.badge.badge-success",
                                                            "Novidade‍"
                                                        )
                                                    ]
                                                ),
                                                m("a.link-footer[href='https://www.catarse.me/pt/team']",
                                                    [
                                                        " Nosso time ",
                                                        m.trust("&lt;"),
                                                        "3"
                                                    ]
                                                ),
                                                m("a.link-footer[href='http://facebook.com/catarse.me']",
                                                    " Facebook"
                                                ),
                                                m("a.link-footer[href='http://twitter.com/catarse']",
                                                    " Twitter"
                                                ),
                                                m("a.link-footer[href='http://instagram.com/catarse']",
                                                    " Instagram"
                                                ),
                                                m("a.link-footer[href='http://github.com/catarse/catarse']",
                                                    " Github"
                                                ),
                                                m("a.link-footer[href='http://blog.catarse.me']",
                                                    " Blog"
                                                ),
                                                m("a.link-footer[href='https://www.catarse.me/pt/jobs']",
                                                    " Trabalhe conosco"
                                                )
                                            ]
                                        ),
                                        m(".w-col.w-col-4.w-col-small-4.w-col-tiny-4.footer-full-firstcolumn",
                                            [
                                                m(".footer-full-signature-text.fontsize-small",
                                                    "Ajuda"
                                                ),
                                                m("a.zendesk_widget.link-footer[href='https://equipecatarse.zendesk.com/account/dropboxes/20298537']",
                                                    " Contato"
                                                ),
                                                m("a.link-footer[href='https://www.catarse.me/pt/press']",
                                                    " Imprensa"
                                                ),
                                                m("a.link-footer[href='http://suporte.catarse.me/']",
                                                    " Central de Suporte"
                                                ),
                                                m("a.link-footer[href='https://www.catarse.me/pt/guides']",
                                                    " Guia dos Realizadores"
                                                ),
                                                m("a.link-footer[href='http://pesquisa.catarse.me/']",
                                                    " Retrato FC Brasil 2013/2014"
                                                ),
                                                m("a.link-footer[href='/pt/terms-of-use']",
                                                    " Termos de uso"
                                                ),
                                                m("a.link-footer[href='/pt/privacy-policy']",
                                                    " Política de privacidade"
                                                )
                                            ]
                                        ),
                                        m(".w-col.w-col-4.w-col-small-4.w-col-tiny-4.footer-full-lastcolumn",
                                            [
                                                m(".footer-full-signature-text.fontsize-small",
                                                    "Navegue"
                                                ),
                                                m("a.w-hidden-small.w-hidden-tiny.link-footer[href='/pt/start']",
                                                    " Comece seu projeto"
                                                ),
                                                m("a.link-footer[href='/pt/explore']",
                                                    " Explore projetos"
                                                ),
                                                m("a.w-hidden-main.w-hidden-medium.w-hidden-small.link-footer[href='http://blog.catarse.me']",
                                                    " Blog"
                                                ),
                                                m("a.w-hidden-main.w-hidden-medium.w-hidden-small.link-footer[href='https://equipecatarse.zendesk.com/account/dropboxes/20298537']",
                                                    " Contato"
                                                ),
                                                m("a.w-hidden-tiny.link-footer[href='/pt/explore?filter=score']",
                                                    " Populares"
                                                ),
                                                m("a.w-hidden-tiny.link-footer[href='/pt/explore?filter=online']",
                                                    " No ar"
                                                ),
                                                m("a.w-hidden-tiny.link-footer[href='/pt/explore?filter=finished']",
                                                    " Finalizados"
                                                )
                                            ]
                                        )
                                    ]
                                )
                            ),
                            m(".w-col.w-col-3.column-social-media-footer",
                                [
                                    m(".footer-full-signature-text.fontsize-small",
                                        "Assine nossa news"
                                    ),
                                    m(".w-form",
                                        m("form[accept-charset='UTF-8'][action='https://catarse.us5.list-manage.com/subscribe/post?u=ebfcd0d16dbb0001a0bea3639&amp;amp;id=149c39709e'][id='mailee-form'][method='post']",
                                            [
                                                m("div", {style: {"display": "none"}},
                                                    [
                                                        m("input[name='utf8'][type='hidden'][value='✓']"),
                                                        m("input[name='authenticity_token'][type='hidden'][value='3R1ctYgwSe+6YyxzrRjacayI8+uEBOc/y6eMPL9x6Ns=']")
                                                    ]
                                                ),
                                                m(".w-form.footer-newsletter",
                                                    m("input.w-input.text-field.prefix[id='EMAIL'][label='email'][name='EMAIL'][placeholder='Digite seu email'][type='email']")
                                                ),
                                                m("a.w-inline-block.btn.btn-edit.postfix.btn-attached[href='#']",
                                                    m("img.footer-news-icon[alt='Icon newsletter'][src='/assets/catarse_bootstrap/icon-newsletter-aa77cede92b4d0a314170a10b1c41754.png']")
                                                )
                                            ]
                                        )
                                    ),
                                    m(".footer-full-signature-text.fontsize-small",
                                        "Redes sociais"
                                    ),
                                    m(".w-widget.w-widget-facebook.u-marginbottom-20",
                                        m(".facebook",
                                            m(".fb-like.fb_iframe_widget[data-colorscheme='dark'][data-href='http://facebook.com/catarse.me'][data-layout='button_count'][data-send='false'][data-show-faces='false'][data-title=''][data-width='260'][fb-iframe-plugin-query='app_id=173747042661491&amp;color_scheme=dark&amp;container_width=225&amp;href=http%3A%2F%2Ffacebook.com%2Fcatarse.me&amp;layout=button_count&amp;locale=pt_BR&amp;sdk=joey&amp;send=false&amp;show_faces=false&amp;width=260'][fb-xfbml-state='rendered']",
                                                m("span", {style: {"vertical-align": "bottom", "width": "107px", "height": "20px"}},
                                                    m("iframe[allowfullscreen='true'][allowtransparency='true'][class=''][frameborder='0'][height='1000px'][name='f34424f8d7e9eec'][scrolling='no'][src='https://www.facebook.com/v2.0/plugins/like.php?app_id=173747042661491&amp;channel=https%3A%2F%2Fstaticxx.facebook.com%2Fconnect%2Fxd_arbiter.php%3Fversion%3D42%23cb%3Df25cdb18199e59c%26domain%3Dwww.catarse.me%26origin%3Dhttps%253A%252F%252Fwww.catarse.me%252Ff20f6c0dd78772c%26relation%3Dparent.parent&amp;color_scheme=dark&amp;container_width=225&amp;href=http%3A%2F%2Ffacebook.com%2Fcatarse.me&amp;layout=button_count&amp;locale=pt_BR&amp;sdk=joey&amp;send=false&amp;show_faces=false&amp;width=260'][title='fb:like Facebook Social Plugin'][width='260px']", {style: {"border": "none", "visibility": "visible", "width": "107px", "height": "20px"}})
                                                )
                                            )
                                        )
                                    ),
                                    m(".w-widget.w-widget-twitter",
                                        m("iframe.twitter-follow-button.twitter-follow-button-rendered[allowtransparency='true'][data-screen-name='catarse'][frameborder='0'][id='twitter-widget-0'][scrolling='no'][src='https://platform.twitter.com/widgets/follow_button.40d5e616f4e685dadc7fb77970f64490.en.html#dnt=false&amp;id=twitter-widget-0&amp;lang=en&amp;screen_name=catarse&amp;show_count=true&amp;show_screen_name=true&amp;size=m&amp;time=1464361714462'][title='Twitter Follow Button']", {style: {"position": "static", "visibility": "visible", "width": "206px", "height": "20px"}})
                                    ),
                                    m(".u-margintop-30",
                                        [
                                            m(".footer-full-signature-text.fontsize-small",
                                                "Change language"
                                            ),
                                            m("[id='google_translate_element']")
                                        ]
                                    )
                                ]
                            )
                        ]
                    )
                ),
                m(".w-container",
                    m(".footer-full-copyleft",
                        [
                            m("img.u-marginbottom-20[alt='Logo footer'][src='/assets/logo-footer-b5edd43e0ec420a39310ea965341f3ea.png']"),
                            m(".lineheight-loose",
                                m("a.link-footer-inline[href='http://github.com/catarse/catarse']",
                                    "Feito com amor | 2016 | Open source"
                                )
                            )
                        ]
                    )
                )
            ]
        );
    }
};

export default footer;
