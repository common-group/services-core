import m from 'mithril';

const faqBox = {
    controller() {

    },
    view(ctrl, args) {
        return m('.w-hidden-small.w-hidden-tiny.card.u-radius[data-ix=\'new-interaction\']',
          [
            m('.fontsize-small.fontweight-semibold.u-marginbottom-20',
              'Quero apoiar, e agora?'
            ),
            m('ul.w-list-unstyled',
              [
                m('li.fontsize-smaller.alt-link.list-question',
                  m('span',
                    [
                      m('span.faq-box-arrow'),
                      ' Como eu apoio este projeto?'
                    ]
                  )
                ),
                m('li.u-marginbottom-10.fontsize-smaller.fontweight-semibold',
                  m('div',
                    [
                      m('span.faq-box-arrow', {style: {'font-weight': '800'}}),
                      m('span.fa.fa-angle-down'),
                      ' Quando o pagamento é efetivado?'
                    ]
                  )
                ),
                m('li',
                  m('p.list-answer.fontsize-smaller',
                    'Assim que o MoIP ou o Paypal confirmar a transação. Se você pagou com cartão, a confirmação deverá ser no mesmo dia. Se foi com boleto, em até 4 dias úteis.'
                  )
                ),
                m('li.alt-link.fontsize-smaller.list-question',
                  m('span',
                    [
                      m('span.faq-box-arrow', {style: {'font-weight': '800'}}),
                      ' E se o projeto não atingir a meta?'
                    ]
                  )
                ),
                m('li.fontsize-smaller.alt-link.list-question',
                  m('span',
                    [
                      m('span.faq-box-arrow'),
                      ' E se eu eu não quiser usar os créditos do Catarse?'
                    ]
                  )
                ),
                m('li.alt-link.fontsize-smaller.list-question',
                  m('span',
                    [
                      m('span.faq-box-arrow'),
                      'Se o projeto for financiado, como receberei minha recompensa?'
                    ]
                  )
                )
              ]
            )
          ]
        );
    }
};

export default faqBox;
