window.c.projectMode = ((m, c, h) => {
    return {
        controller: (args) => {
            const project = args.project,
                mode = project.mode,
                tooltipText = (mode === 'aon') ? `Somente receberá os recursos se atingir ou ultrapassar a meta até o dia ${h.momentify(project.zone_expires_at, 'DD/MM/YYYY')}.` : 'O realizador receberá todos os recursos quando encerrar a campanha, mesmo que não tenha atingido esta meta.';

            return {
                mode: mode,
                tooltipText: tooltipText
            };
        },
        view: (ctrl, args) => {
            let mode = ctrl.mode,
                modeImgSrc = (mode === 'aon') ? '/assets/aon-badge.png' : '/assets/flex-badge.png',
                modeTitle = (mode === 'aon') ? 'Campanha Tudo-ou-nada ' : 'Campanha Flexível ',
                tooltip = (el) => {
                    return m.component(c.tooltip, {
                        el: el,
                        text: ctrl.tooltipText,
                        width: 280
                    });
                };

            return m(`#${mode}.w-row`, [
                m('.w-col.w-col-2.w-col-small-2.w-col-tiny-2', [
                    m(`img[src="${modeImgSrc}"][width='30']`)
                ]),
                m('.w-col.w-col-10.w-col-small-10.w-col-tiny-10', [
                    m('.fontsize-smaller.fontweight-semibold', 'Meta R$' + h.formatNumber(args.project.goal)),
                    m('.w-inline-block.fontsize-smallest._w-inline-block', [
                        modeTitle,
                        tooltip('span.w-inline-block._w-inline-block.fa.fa-question-circle.fontcolor-secondary')
                    ])
                ])
            ]);
        }
    };
}(window.m, window.c, window.c.h));
