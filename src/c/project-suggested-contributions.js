/**
 * window.c.ProjectSuggestedContributions component
 * A Project-show page helper to show suggested amounts of contributions
 *
 * Example of use:
 * view: () => {
 *   ...
 *   m.component(c.ProjectSuggestedContributions, {project: project})
 *   ...
 * }
 */
import m from 'mithril';
import _ from 'underscore';

const projectSuggestedContributions = {
    view(ctrl, args) {
        const project = args.project();

        const suggestionUrl = (amount) => {
            return `/projects/${project.project_id}/contributions/new?amount=${amount}`;
        }, suggestedValues = [10, 25, 50, 100];

        return m('#suggestions', _.map(suggestedValues, (amount) => {
            return project ? m(`a[href="${suggestionUrl(amount)}"].card-reward.card-big.card-secondary.u-marginbottom-20`, [
                m('.fontsize-larger', `R$ ${amount}`)
            ]) : '';
        }));
    }
};

export default projectSuggestedContributions;
