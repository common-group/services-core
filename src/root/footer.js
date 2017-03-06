import m from 'mithril';
import h from '../h';

const footer = {
    view() {
        return m('footer.main-footer.main-footer-neg',
            [
                m('section.w-container',
                    m('.w-row',
                        [
                            m('.w-col.w-col-9',
                                m('.w-row',
                                    [
                                        m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.w-hidden-tiny',
                                            [
                                                m('.footer-full-signature-text.fontsize-small',
                                                    'Bem-vindo'
                                                ),
                                                m('a.link-footer[href=\'http://ano.catarse.me/2016?ref=ctrse_footer\']',
                                                    [
                                                        'Retrospectiva 2016',
                                                        m.trust('&nbsp;'),
                                                        m('span.badge.badge-success',
                                                            'Novidade‍'
                                                        )
                                                    ]
                                                ),
                                                m('a.link-footer[href=\'http://crowdfunding.catarse.me/paratodos?ref=ctrse_footer\']',
                                                    ' Como funciona'
                                                ),
                                                m('a.link-footer[href=\'https://www.catarse.me/pt/flex?ref=ctrse_footer\']',
                                                    ' Catarse flex'
                                                ),
                                                m('a.link-footer[href=\'https://www.catarse.me/pt/team?ref=ctrse_footer\']',
                                                    [
                                                        ' Nosso time ',
                                                        m.trust('&lt;'),
                                                        '3'
                                                    ]
                                                ),
                                                m('a.link-footer[href=\'http://facebook.com/catarse.me\']',
                                                    ' Facebook'
                                                ),
                                                m('a.link-footer[href=\'http://twitter.com/catarse\']',
                                                    ' Twitter'
                                                ),
                                                m('a.link-footer[href=\'http://instagram.com/catarse\']',
                                                    ' Instagram'
                                                ),
                                                m('a.link-footer[href=\'http://github.com/catarse/catarse\']',
                                                    ' Github'
                                                ),
                                                m('a.link-footer[href=\'http://blog.catarse.me\']',
                                                    ' Blog'
                                                ),
                                                m('a.link-footer[href=\'https://www.catarse.me/pt/jobs\']',
                                                    ' Trabalhe conosco'
                                                )
                                            ]
                                        ),
                                        m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.footer-full-firstcolumn',
                                            [
                                                m('.footer-full-signature-text.fontsize-small',
                                                    'Ajuda'
                                                ),
                                                m('a.link-footer[href=\'http://suporte.catarse.me/hc/pt-br/requests/new\'][target="_BLANK"]',
                                                    ' Contato'
                                                ),
                                                m('a.link-footer[href=\'http://crowdfunding.catarse.me/nossa-taxa?ref=ctrse_footer\']',
                                                    ' Nossa Taxa'
                                                ),
                                                m('a.link-footer[href=\'https://www.catarse.me/pt/press?ref=ctrse_footer\']',
                                                    ' Imprensa'
                                                ),
                                                m('a.link-footer[href=\'http://suporte.catarse.me?ref=ctrse_footer/\']',
                                                    ' Central de Suporte'
                                                ),
                                                m('a.link-footer[href=\'https://www.catarse.me/pt/guides?ref=ctrse_footer\']',
                                                    ' Guia dos Realizadores'
                                                ),
                                                m('a.link-footer[href=\'http://pesquisa.catarse.me/\']',
                                                    ' Retrato FC Brasil 2013/2014'
                                                ),
                                                m('a.link-footer[href=\'/pt/terms-of-use\']',
                                                    ' Termos de uso'
                                                ),
                                                m('a.link-footer[href=\'/pt/privacy-policy\']',
                                                    ' Política de privacidade'
                                                )
                                            ]
                                        ),
                                        m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.footer-full-lastcolumn',
                                            [
                                                m('.footer-full-signature-text.fontsize-small',
                                                    'Navegue'
                                                ),
                                                m('a.w-hidden-small.w-hidden-tiny.link-footer[href=\'/pt/start?ref=ctrse_footer\']',
                                                    ' Comece seu projeto'
                                                ),
                                                m('a.u-marginbottom-30.link-footer[href=\'http://crowdfunding.catarse.me/financiamento-coletivo-musica-independente?ref=ctrse_footer\']',
                                                    [
                                                        'Música no Catarse!',
                                                        m.trust('&nbsp;'),
                                                        m('span.badge.badge-success',
                                                            'Novidade‍'
                                                        )
                                                    ]
                                                ),
                                                m('a.link-footer[href=\'/pt/explore?ref=ctrse_footer\']',
                                                    ' Explore projetos'
                                                ),
                                                m('a.w-hidden-main.w-hidden-medium.w-hidden-small.link-footer[href=\'http://blog.catarse.me?ref=ctrse_footer\']',
                                                    ' Blog'
                                                ),
                                                m('a.w-hidden-main.w-hidden-medium.w-hidden-small.link-footer[href=\'http://suporte.catarse.me/hc/pt-br/requests/new\']',
                                                    ' Contato'
                                                ),
                                                m('a.w-hidden-tiny.link-footer[href=\'/pt/explore?filter=score&ref=ctrse_footer\']',
                                                    ' Populares'
                                                ),
                                                m('a.w-hidden-tiny.link-footer[href=\'/pt/explore?filter=online&ref=ctrse_footer\']',
                                                    ' No ar'
                                                ),
                                                m('a.w-hidden-tiny.link-footer[href=\'/pt/explore?filter=finished&ref=ctrse_footer\']',
                                                    ' Finalizados'
                                                )
                                            ]
                                        )
                                    ]
                                )
                            ),
                            m('.w-col.w-col-3.column-social-media-footer',
                                [
                                    m('.footer-full-signature-text.fontsize-small',
                                        'Assine nossa news'
                                    ),
                                    m('.w-form',
                                        m(`form[accept-charset='UTF-8'][action='${h.getMailchimpUrl()}'][id='mailee-form'][method='post']`,
                                            [
                                                m('.w-form.footer-newsletter',
                                                    m('input.w-input.text-field.prefix[id=\'EMAIL\'][label=\'email\'][name=\'EMAIL\'][placeholder=\'Digite seu email\'][type=\'email\']')
                                                ),
                                                m('button.w-inline-block.btn.btn-edit.postfix.btn-attached[style="padding:0;"]',
                                                    m('img.footer-news-icon[alt=\'Icon newsletter\'][src=\'/assets/catarse_bootstrap/icon-newsletter.png\']')
                                                )
                                            ]
                                        )
                                    ),
                                    m('.footer-full-signature-text.fontsize-small',
                                        'Change language'
                                    ),
                                    m('[id=\'google_translate_element\']')
                                ]
                            )
                        ]
                    )
                ),
                m('.w-container',
                    m('.footer-full-copyleft',
                        [
                            m('img.u-marginbottom-20[alt=\'Logo footer\'][src=\'/assets/logo-footer.png\']'),
                            m('.lineheight-loose',
                                m('a.link-footer-inline[href=\'http://github.com/catarse/catarse\']',
                                   ` Feito com amor | ${new Date().getFullYear()} | Open source`
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
