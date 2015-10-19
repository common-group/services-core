window.c.ProjectComments = (function(m) {
    return {
        view: function(ctrl, args) {
            var project = args.project;
            return m('.fb-comments[data-href="http://www.catarse.me/' + project.permalink + '"][data-num-posts=50][data-width="610"]');
        }
    };
}(window.m));
