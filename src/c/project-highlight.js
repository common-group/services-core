window.c.ProjectHighlight = (function(m, _, h){
  return {
    controller: function() {
      var displayShareBox = h.toggleProp(false, true);

      return {
        displayShareBox: displayShareBox
      };
    },
    //FIXME: Add img when video is not present
    view: function(ctrl, args) {
      var project = args.project;
      return m('#project-highlight', [
        (project.video_embed_url ? m('.w-embed.w-video.project-video.mf', [
          m('iframe.embedly-embed[itemprop="video"][src=" ' + project.video_embed_url + '"][frameborder="0"][allowFullScreen]')
        ]) : m('img.w-embed.w-video.project-video.mf[src="' + (project.video_cover_image || project.original_image) + '"]')),
        m('.project-blurb', project.headline),
        m('.u-text-center-small-only.u-marginbottom-30', [
          (!_.isNull(project.address) ?
            m('a.btn.btn-inline.btn-small.btn-transparent.link-hidden-light.u-marginbottom-10[href="js:void(0);"]', [
              m('span.fa.fa-map-marker'), ' ' + project.address.city + ', ' + project.address.state_acronym
            ]) : ''
          ),
          m('a.btn.btn-inline.btn-small.btn-transparent.link-hidden-light[href="/explore/by_category_id/#"' + project.category_id + ']', [
            m('span.fa.fa-tag'), ' ',
            project.category_name
          ]),
          m('a.btn.btn-small.btn-terciary.btn-inline[href="js:void(0);"]', {onclick: ctrl.displayShareBox.toggle}, 'Compartilhar'),
          (ctrl.displayShareBox() ?
            m(".pop-share", [
              m(".w-hidden-main.w-hidden-medium.w-clearfix", [
                m("a.btn.btn-small.btn-terciary.btn-inline.u-right[href='js:void(0);']", "Fechar"),
                m(".fontsize-small.fontweight-semibold.u-marginbottom-30", "Compartilhe este projeto")
              ]),
              m(".w-widget.w-widget-facebook.w-hidden-small.w-hidden-tiny.share-block", [
                m("iframe[allowtransparency='true'][frameborder='0'][scrolling='no'][src='//www.facebook.com/plugins/like.php?href=https%3A%2F%2Ffacebook.com%2Fwebflow&layout=button_count&locale=en_US&action=like&show_faces=false&share=false']", {style: {"border": " none", " overflow": " hidden", " width": " 90px", " height": " 20px"}})
              ]),
              m(".w-widget.w-widget-twitter.w-hidden-small.w-hidden-tiny.share-block", [
                m("iframe[allowtransparency='true'][frameborder='0'][scrolling='no'][src='//platform.twitter.com/widgets/tweet_button.html#url=http%3A%2F%2Fwebflow.com&counturl=webflow.com&text=Check%20out%20this%20site&count=horizontal&size=m&dnt=true']", {style: {"border": " none", " overflow": " hidden", " width": " 110px", " height": " 20px"}})
              ]),
              m("a.w-hidden-small.w-hidden-tiny.fontsize-small.link-hidden.fontcolor-secondary[href='#']", "< embed >"),
              m("a.w-hidden-main.w-hidden-medium.btn.btn-medium.btn-fb.u-marginbottom-20[href='#']", [
                m("span.fa.fa-facebook", "."),
                " Compartilhe"
              ]),
              m("a.w-hidden-main.w-hidden-medium.btn.btn-medium.btn-tweet.u-marginbottom-20[href='#']", [
                m("span.fa.fa-twitter", "."),
                " Tweet"
              ]),
              m("a.w-hidden-main.w-hidden-medium.btn.btn-medium[href='#']", [
                m("span.fa.fa-whatsapp", "."),
                " Whatsapp"
              ])
            ]) : ''
          )
        ])
      ]);
    }
  };
}(window.m, window._, window.c.h));
