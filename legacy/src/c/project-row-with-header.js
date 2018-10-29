import m from 'mithril';
import _ from 'underscore';
import h from '../h';
import projectCard from './project-card';

const projectRowWithHeader = {
    view: function({attrs}) {
        const collection = attrs.collection,
            title = attrs.title || collection.title,
            ref = attrs.ref,
            showFriends = attrs.showFriends,
            wrapper = attrs.wrapper || `.section.u-marginbottom-40${attrs.isOdd ? '.bg-gray' : ''}`;

        if (collection.loader() || collection.collection().length > 0) {
            return m(wrapper, [
                m('.w-container', [
                    (!_.isUndefined(collection.title) || !_.isUndefined(collection.hash)) ? 
                    m('.u-marginbottom-40.u-text-center-small-only', [
                        m('div', 
                            _.map(collection.badges, badge => m(`img[src="/assets/catarse_bootstrap/${badge}.png"][width='105']`))
                        ),
                        m('.w-row', [
                            m('.w-col.w-col-8', m('.fontsize-larger.u-marginbottom-20', `${title} populares`)),
                            m('.w-col.w-col-4', [
                                m(`a.btn.btn-small.btn-terciary.btn-inline.u-right-big-only[href="/explore?ref=${ref}&filter=${collection.hash}"]`, 
                                    { oncreate: m.route.link },
                                    'Ver todos'
                                ),
                                (showFriends ? 
                                    m(`a.btn.btn-small.btn-terciary.btn-inline.u-right-big-only.btn-no-border[href="/connect-facebook?ref=${ref}"]`,  
                                        'Encontrar amigos'
                                    )
                                        :
                                    ''
                                )
                            ])
                        ])
                    ]) : '',
                    collection.loader() ? h.loader() : m('.w-row', _.map(collection.collection(), project => m(projectCard, {
                        project,
                        ref,
                        showFriends
                    })))
                ])
            ]);
        }
        return m('div');
    }
};

export default projectRowWithHeader;
