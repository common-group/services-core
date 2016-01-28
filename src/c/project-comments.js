window.c.ProjectComments = (function(m, c, h) {
    return {
        controller: () => {
            const loadComments = (el, isInitialized) => {
                return (el, isInitialized) => {
                    if (isInitialized) {return;}
                    h.fbParse();
                };
            };

            return {loadComments: loadComments};
        },

        view: function(ctrl, args) {
            var project = args.project();
            return m('.fb-comments[data-href="http://www.catarse.me/' + project.permalink + '"][data-num-posts=50][data-width="610"]', {config: ctrl.loadComments()});
        }
    };
}(window.m, window.c, window.c.h));
