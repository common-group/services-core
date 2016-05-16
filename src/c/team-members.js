import m from 'mithril';
import _ from 'underscore';
import models from '../models';

const teamMembers = {
    controller() {
        const vm = {
                collection: m.prop([])
            },

            groupCollection = (collection, groupTotal) => {
                return _.map(_.range(Math.ceil(collection.length / groupTotal)), (i) => {
                    return collection.slice(i * groupTotal, (i + 1) * groupTotal);
                });
            };

        models.teamMember.getPage().then((data) => {
            vm.collection(groupCollection(data, 4));
        });

        return {
            vm: vm
        };
    },
    view(ctrl) {
        return m('#team-members-static.w-section.section', [
            m('.w-container', [
                _.map(ctrl.vm.collection(), (group) => {
                    return m('.w-row.u-text-center', [
                        _.map(group, (member) => {
                            return m('.team-member.w-col.w-col-3.w-col-small-3.w-col-tiny-6.u-marginbottom-40', [
                                m('a.alt-link[href="/users/' + member.id + '"]', [
                                    m('img.thumb.big.u-round.u-marginbottom-10[src="' + member.img + '"]'),
                                    m('.fontweight-semibold.fontsize-base', member.name)
                                ]),
                                m('.fontsize-smallest.fontcolor-secondary', 'Apoiou ' + member.total_contributed_projects + ' projetos')
                            ]);
                        })
                    ]);
                })
            ])
        ]);
    }
};

export default teamMembers;
