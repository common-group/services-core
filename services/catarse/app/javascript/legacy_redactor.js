if (!RedactorPlugins) var RedactorPlugins = {};

(function ($) {
  RedactorPlugins.video = function () {
    return {
      reUrlYoutube: /https?:\/\/(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube\.com\S*[^\w\-\s])([\w\-]{11})(?=[^\w\-]|$)(?![?=&+%\w.-]*(?:['"][^<>]*>|<\/a>))[?=&+%\w.-]*/ig,
      reUrlVimeo: /https?:\/\/(www\.)?vimeo.com\/(\d+)($|\/)/,
      getTemplate: function () {
        return String()
          + '<section id="redactor-modal-video-insert">'
          + '<label>' + this.lang.get('video_html_code') + '</label>'
          + '<textarea id="redactor-insert-video-area" style="height: 160px;"></textarea>'
          + '</section>';
      },
      init: function () {
        var button = this.button.addAfter('image', 'video', this.lang.get('video'));
        this.button.addCallback(button, this.video.show);
      },
      show: function () {
        this.modal.addTemplate('video', this.video.getTemplate());

        this.modal.load('video', this.lang.get('video'), 700);
        this.modal.createCancelButton();

        var button = this.modal.createActionButton(this.lang.get('insert'));
        button.on('click', this.video.insert);

        this.selection.save();
        this.modal.show();

        $('#redactor-insert-video-area').focus();

      },
      insert: function () {
        var data = $('#redactor-insert-video-area').val();

        if (!data.match(/<iframe|<video/gi)) {
          data = this.clean.stripTags(data);

          // parse if it is link on youtube & vimeo
          var iframeStart = '<iframe style="width: 500px; height: 281px;" src="',
            iframeEnd = '" frameborder="0" allowfullscreen></iframe>';

          if (data.match(this.video.reUrlYoutube)) {
            data = data.replace(this.video.reUrlYoutube, iframeStart + '//www.youtube.com/embed/$1' + iframeEnd);
          }
          else if (data.match(this.video.reUrlVimeo)) {
            data = data.replace(this.video.reUrlVimeo, iframeStart + '//player.vimeo.com/video/$2' + iframeEnd);
          }
        }

        this.selection.restore();
        this.modal.close();

        var current = this.selection.getBlock() || this.selection.getCurrent();

        if (current) $(current).after(data);
        else {
          this.insert.html(data);
        }

        this.code.sync();
      }

    };
  };
})(jQuery);

window.init_redactor = function () {
  var csrf_token = $('meta[name=csrf-token]').attr('content');
  var csrf_param = $('meta[name=csrf-param]').attr('content');
  var params;
  if (csrf_param !== undefined && csrf_token !== undefined) {
    params = csrf_param + "=" + encodeURIComponent(csrf_token);
  }

  $('.redactor').redactor({
    source: false,
    formatting: ['p'],
    formattingAdd: [
      {
        tag: 'blockquote',
        title: 'Citar',
        class: 'fontsize-base quote',
        clear: true
      },

      {
        tag: 'p',
        title: 'Cabeçalho 1',
        class: 'fontsize-larger fontweight-semibold',
        clear: true
      },
      {
        tag: 'p',
        title: 'Cabeçalho 2',
        class: 'fontsize-large',
        clear: true
      }],
    lang: 'pt_br',
    maxHeight: 800,
    minHeight: 300,
    convertVideoLinks: true,
    convertUrlLinks: true,
    convertImageLinks: false,
    // You can specify, which ones plugins you need.
    // If you want to use plugins, you have add plugins to your
    // application.js and application.css files and uncomment the line below:
    // "plugins": ['fontsize', 'fontcolor', 'fontfamily', 'fullscreen', 'textdirection', 'clips'],
    plugins: ['video'],
    "imageUpload": "/redactor_rails/pictures?" + params,
    "imageGetJson": "/redactor_rails/pictures",
    "path": "/assets/redactor-rails",
    "css": "style.css"
  });
};

$(document).on('ready page:load', window.init_redactor);
