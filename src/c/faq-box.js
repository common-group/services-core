import m from 'mithril';
import I18n from 'i18n-js';
import userVM from '../vms/user-vm';
import h from '../h';

const I18nScope = _.partial(h.i18nScope, 'projects.faq');

const faqBox = {
    controller(args) {
        const mode = args.mode,
            questions = args.faq.questions,
            selectedQuestion = m.prop(-1),
            user = m.prop({ name: '...' }),
            tKey = () => !args.vm.isInternational()
                       ? `${mode}`
                       : `international.${mode}`;

        const selectQuestion = idx => () => idx === selectedQuestion()
                                              ? selectedQuestion(-1)
                                              : selectedQuestion(idx);

        // This function rewrites questions from translate with proper scope for links
        const scopedQuestions = () => {
            const updatedQuestions = {};
            _.each(questions, (quest, idx) => {
                _.extend(updatedQuestions, {
                    [idx + 1]: {
                        question: I18n.t(`${tKey()}.questions.${idx}.question`, I18nScope()),
                        answer: I18n.t(`${tKey()}.questions.${idx}.answer`,
                                    I18nScope(
                                        { userLink: `/users/${user().id}`,
                                            userName: user().public_name || user().name
                                        }
                                    )
                                )
                    }
                });
            });
            return updatedQuestions;
        };

        userVM.fetchUser(args.projectUserId, false).then(data => user(_.first(data)));

        return {
            scopedQuestions,
            selectQuestion,
            selectedQuestion,
            tKey
        };
    },
    view(ctrl, args) {
        return m('.faq-box.w-hidden-small.w-hidden-tiny.card.u-radius',
            [
                m('.w-row.u-marginbottom-30',
                    [
                        m('.w-col.w-col-2.w-col-small-2.w-col-tiny-2',
                         m('img[width=\'30\']', {
                             src: args.mode === 'aon' ? '/assets/aon-badge.png' : '/assets/flex-badge.png'
                         })
                     ),
                        m('.w-col.w-col-10.w-col-small-10.w-col-tiny-10',
                         m('.w-inline-block.fontsize-smallest.w-inline-block.fontcolor-secondary',
                             I18n.t(`${ctrl.tKey()}.description`, I18nScope())
                         )
                     )
                    ]
             ),
                m('.u-marginbottom-20.fontsize-small.fontweight-semibold',
                I18n.t(`${args.vm.isInternational() ? 'international_title' : 'title'}`, I18nScope())
            ),
                m('ul.w-list-unstyled',
                _.map(ctrl.scopedQuestions(), (question, idx) => [
                    m(`li#faq_question_${idx}.fontsize-smaller.alt-link.list-question`, {
                        onclick: ctrl.selectQuestion(idx)
                    }, m('span',
                        [
                            m('span.faq-box-arrow'),
                            ` ${question.question}`
                        ]
                          )
                        ),
                    m('li.list-answer', {
                        class: ctrl.selectedQuestion() === idx ? 'list-answer-opened' : ''
                    }, m(`p#faq_answer_${idx}.fontsize-smaller`, m.trust(question.answer))
                        )
                ])
            )
            ]
        );
    }
};

export default faqBox;
