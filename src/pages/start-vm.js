window.c.pages.startVM = ((_) => {
    return (I18n) => {
        const i18nStart = I18n.translations[I18n.currentLocale()].pages.start,
            testimonials = i18nStart.testimonials,
            panes = i18nStart.panes,
            qa = i18nStart.qa;

        return {
            testimonials: _.map(testimonials, (testimonial) => {
                return {
                    thumbUrl: testimonial.thumb,
                    content: testimonial.content,
                    name: testimonial.name,
                    totals: testimonial.totals
                };
            }),
            panes: _.map(panes, (pane) => {
                return {
                    label: pane.label,
                    src: pane.src
                };
            }),
            questions: {
                col_1: _.map(qa.col_1, (question) => {
                    return {
                        question: question.question,
                        answer: question.answer
                    };
                }),
                col_2: _.map(qa.col_2, (question) => {
                    return {
                        question: question.question,
                        answer: question.answer
                    };
                })
            },
            categoryProjects: [{
                categoryId: 23,
                projects: [4142, 1550]
            }, {
                categoryId: 1,
                projects: [6914, 9438]
            }, {
                categoryId: 18,
                projects: [17453, 1705]
            }, {
                categoryId: 13,
                projects: [10519, 17219]
            }, {
                categoryId: 31,
                projects: [9670, 16012]
            }, {
                categoryId: 21,
                projects: [14610, 10786]
            }, {
                categoryId: 17,
                projects: [7917, 12993]
            }, {
                categoryId: 10,
                projects: [2073, 9744]
            }, {
                categoryId: 14,
                projects: [5710]
            }, {
                categoryId: 15,
                projects: [9521, 15004]
            }, {
                categoryId: 20,
                projects: [11366, 8024]
            }, {
                categoryId: 7,
                projects: [14391, 11694]
            }, {
                categoryId: 19,
                projects: [11113, 9531]
            }, {
                categoryId: 16,
                projects: [11812, 15251]
            }, {
                categoryId: 9,
                projects: [5142, 4725]
            }, {
                categoryId: 29,
                projects: [4229, 16322]
            }]
        };
    };
}(window._));
