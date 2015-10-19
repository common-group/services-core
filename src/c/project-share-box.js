window.c.ProjectShareBox = ((m, h) => {
    return {
        controller: () => {
            return {
                displayEmbed: h.toggleProp(false, true)
            };
        },
        view: (ctrl, args) => {
            return m('.pop-share', {
                style: 'display: block;'
            }, [
                m('.w-hidden-main.w-hidden-medium.w-clearfix', [
                    m('a.btn.btn-small.btn-terciary.btn-inline.u-right', {
                        onclick: args.displayShareBox.toggle
                    }, 'Fechar'),
                    m('.fontsize-small.fontweight-semibold.u-marginbottom-30', 'Compartilhe este projeto')
                ]),
                m('.w-widget.w-widget-facebook.w-hidden-small.w-hidden-tiny.share-block', [
                    m('iframe[allowtransparency="true"][width="150px"][height="22px"][frameborder="0"][scrolling="no"][src="https://www.facebook.com/v2.0/plugins/share_button.php?app_id=173747042661491&channel=https%3A%2F%2Fs-static.ak.facebook.com%2Fconnect%2Fxd_arbiter%2F44OwK74u0Ie.js%3Fversion%3D41%23cb%3Df7d9b900c%26domain%3Dwww.catarse.me%26origin%3Dhttps%253A%252F%252Fwww.catarse.me%252Ff4b3ad0c8%26relation%3Dparent.parent&container_width=0&href=https%3A%2F%2Fwww.catarse.me%2Fpt%2F' + args.project.permalink + '%3Fref%3Dfacebook&layout=button_count&locale=pt_BR&sdk=joey"]')
                ]),
                m('.w-widget.w-widget-twitter.w-hidden-small.w-hidden-tiny.share-block', [
                    m('iframe[allowtransparency="true"][width="120px"][height="22px"][frameborder="0"][scrolling="no"][src="//platform.twitter.com/widgets/tweet_button.8d007ddfc184e6776be76fe9e5e52d69.en.html#_=1442425984936&count=horizontal&dnt=false&id=twitter-widget-1&lang=en&original_referer=https%3A%2F%2Fwww.catarse.me%2Fpt%2F' + args.project.permalink + '&size=m&text=Confira%20o%20projeto%20' + args.project.name + '%20no%20%40catarse&type=share&url=https%3A%2F%2Fwww.catarse.me%2Fpt%2F' + args.project.permalink + '%3Fref%3Dtwitter&via=catarse"]')
                ]),
                m('a.w-hidden-small.widget-embed.w-hidden-tiny.fontsize-small.link-hidden.fontcolor-secondary[href="js:void(0);"]', {
                    onclick: ctrl.displayEmbed.toggle
                }, '< embed >'), (ctrl.displayEmbed() ? m('.embed-expanded.u-margintop-30', [
                    m('.fontsize-small.fontweight-semibold.u-marginbottom-20', 'Insira um widget em seu site'),
                    m('.w-form', [
                        m('input.w-input[type="text"][value="<iframe frameborder="0" height="314px" src="https://www.catarse.me/pt/projects/' + args.project.id + '/embed" width="300px" scrolling="no"></iframe>"]')
                    ]),
                    m('.card-embed', [
                        m('iframe[frameborder="0"][height="350px"][src="/projects/' + args.project.id + '/embed"][width="300px"][scrolling="no"]')
                    ])
                ]) : ''),
                m('a.w-hidden-main.w-hidden-medium.btn.btn-medium.btn-fb.u-marginbottom-20[href="http://www.facebook.com/sharer/sharer.php?u=https://www.catarse.me/' + args.project.permalink + '?ref=facebook&title=' + args.project.name + '"][target="_blank"]', [
                    m('span.fa.fa-facebook'), ' Compartilhe'
                ]),
                m('a.w-hidden-main.w-hidden-medium.btn.btn-medium.btn-tweet.u-marginbottom-20[href="http://twitter.com/?status=Acabei de apoiar o projeto ' + args.project.name + ' htts://www.catarse.me/' + args.project.permalink + '?ref=twitterr"][target="_blank"]', [
                    m('span.fa.fa-twitter'), ' Tweet'
                ]),
            ]);
        }
    };
}(window.m, window.c.h));
