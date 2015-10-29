window.c.TeamTotal = (function(m, h, models) {
    return {
        controller: function() {
            var vm = {
                collection: m.prop([])
            };

            models.teamTotal.getRow().then(function(data) {
                vm.collection(data);
            });

            return {
                vm: vm
            };
        },

        view: function(ctrl) {
            return m('#team-total-static.w-section.section-one-column.section.u-margintop-40.u-text-center.u-marginbottom-20', [
                ctrl.vm.collection().map(function(teamTotal) {
                    return m('.w-container', [
                        m('.w-row', [
                            m('.w-col.w-col-2'),
                            m('.w-col.w-col-8', [
                                m('.fontsize-base.u-marginbottom-30',
                                    'Hoje somos ' + teamTotal.member_count + ' pessoas espalhadas por ' + teamTotal.total_cities + ' cidades em ' + teamTotal.countries.length +
                                    ' países (' + teamTotal.countries.toString() + ')! O Catarse é independente, sem investidores, de código aberto e construído com amor. Nossa paixão é construir um ambiente onde cada vez mais projetos possam ganhar vida.'),
                                m('.fontsize-larger.lineheight-tight.text-success',
                                    'Nossa equipe, junta, já apoiou R$' + h.formatNumber(teamTotal.total_amount) + ' para ' + teamTotal.total_contributed_projects + ' projetos!')
                            ]),
                            m('.w-col.w-col-2')
                        ])
                    ]);
                })
            ]);
        }
    };
}(window.m, window.c.h, window.c.models));
