window.c.TeamMembers = (function(_, m, models) {
    return {
        controller: function() {
            var vm = {
                    collection: m.prop([])
                },

                groupCollection = function(collection, groupTotal) {
                    return _.map(_.range(Math.ceil(collection.length / groupTotal)), function(i) {
                        return collection.slice(i * groupTotal, (i + 1) * groupTotal);
                    });
                };

            models.teamMember.getPage().then(function(data) {
                vm.collection(groupCollection(data, 4));
            });

            return {
                vm: vm
            };
        },

        view: function(ctrl) {
            return m('#team-members-static.w-section.section', [
                m('.w-container', [
                    _.map(ctrl.vm.collection(), function(group) {
                        return m('.w-row.u-text-center', [
                            _.map(group, function(member) {
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
}(window._, window.m, window.c.models));
