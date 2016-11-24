/* @flow */
import _ from 'underscore';
import m from 'mithril';

const blogVM : { getBlogPosts : Function } = {
    getBlogPosts () : Promise<any> {
        const deferred = m.deferred();
        const posts = _.first(document.getElementsByTagName('body')).getAttribute('data-blog');

        if (posts) {
            deferred.resolve(JSON.parse(posts));
        } else {
            m.request({method: 'GET', url: '/posts'})
                .then(deferred.resolve)
                .catch(deferred.reject);
        }

        return deferred.promise;
    }
};

export default blogVM;
