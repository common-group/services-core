/**
 * window.c.ProjectSuggestedContributions component
 * A Project-show page helper to show suggested ammounts of contributions
 *
 * Example of use:
 * view: () => {
 *   ...
 *   m.component(c.ProjectSuggestedContributions, {project: project})
 *   ...
 * }
 */

window.c.ProjectSuggestedContributions = (function(m, c, _) {
    return {
        view: (ctrl, args) => {
            const project = args.project;
            let suggestionUrl = (ammount) => {
                ammount = _.isNumber(ammount) ? ammount : 0;
                return `/projects/${project.project_id}/contributions/new?ammount=${ammount}`;
            }, suggestedValues = [10, 25, 50, 100, '???'];

            return m('#suggestions', _.map(suggestedValues, (ammount) => {
                return m(`a[href="${suggestionUrl(ammount)}"].card-reward.card-big.card-secondary.u-marginbottom-20`, [
                    m('.fontsize-larger', `R$ ${ammount}`)
                ]);
            }));
        }
    };
}(window.m, window.c, window._));
