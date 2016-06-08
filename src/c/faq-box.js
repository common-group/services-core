import m from 'mithril';
import I18n from 'i18n-js';
import userVM from '../vms/user-vm';
import h from '../h';

const I18nScope = _.partial(h.i18nScope, 'projects.faq');

const faqBox = {
    controller(args) {
        const mode = args.mode,
            questions = args.faq.questions,
            scopedQuestions = m.prop(questions),
            vm = userVM(args.projectUserId);

        vm.lUser.load().then((data) => {
            //Rewrites questions from translate with proper scope
            const user = data[0];
            const updatedQuestions = _.map(questions, (quest, idx) => {
                return {
                    question: quest.question,
                    answer: I18n.t(`${mode}.questions.${idx}.answer`, I18nScope({userLink: `/users/${user.id}`, userName: user.name}))
                };
            });

            scopedQuestions(updatedQuestions);
        });

        return {
            scopedQuestions: scopedQuestions
        };
    },
    view(ctrl, args) {
        return m('.w-hidden-small.w-hidden-tiny.card.u-radius[data-ix=\'new-interaction\']',
          [
              m(".w-row.u-marginbottom-30",
                 [
                     m(".w-col.w-col-2.w-col-small-2.w-col-tiny-2",
                         m("img[width='30']", {
                             src: args.mode === 'aon' ? '/assets/aon-badge.png' : '/assets/flex-badge.png'
                         })
                     ),
                     m(".w-col.w-col-10.w-col-small-10.w-col-tiny-10",
                         m(".w-inline-block.fontsize-smallest.w-inline-block.fontcolor-secondary",
                             args.faq.description
                         )
                     )
                 ]
             ),
             m(".u-marginbottom-20.fontsize-small.fontweight-semibold",
                "Dúvidas frequentes"
            ),
            m('ul.w-list-unstyled',
                _.map(ctrl.scopedQuestions(), (question) => {
                    return [
                        m('li.fontsize-smaller.alt-link.list-question',
                          m('span',
                            [
                              m('span.faq-box-arrow'),
                              ` ${question.question}`
                            ]
                          )
                        ),
                        m('li',
                          m('p.list-answer.fontsize-smaller', question.answer)
                        )
                    ]
                })
            )
          ]
        );
    }
};

export default faqBox;
