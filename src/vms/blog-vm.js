/* @flow */
import _ from 'underscore';
import m from 'mithril';

let blogPosts : Array<string> = [];

const blogVM : { getBlogPosts : Function } = {
    getBlogPosts () {
        const deferred = m.deferred();

        if (blogPosts) {
            deferred.resolve(blogPosts);
        }
        const posts = _.first(document.getElementsByTagName('body')).getAttribute('data-blog');

        if (posts) {
            blogPosts = JSON.parse(posts);
            deferred.resolve(blogPosts);
        } else {
            m.request({method: 'GET', url: '/posts'})
                .then(deferred.resolve)
                .catch(deferred.reject);
        }

        return deferred.promise;
    }
};

export default blogVM;
