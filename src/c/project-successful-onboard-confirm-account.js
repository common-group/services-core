/**
 * window.c.ProjectSuccessfulOnboardConfirmAccount component
 * render project account data to confirm or add error
 *
 * Example:
 * m.component(c.ProjectSuccessfulOnboardConfirmAccount, {projectAccount: projectAccount})
 **/

window.c.ProjectSuccessfulOnboardConfirmAccount = ((m, c, h, _) => {
    return {
        controller: (args) => {
            const actionStages = {
                      'start': 'ProjectSuccessfulOnboardConfirmAccountActions',
                      'error': 'ProjectSuccessfulOnboardConfirmAccountError',
                      'accept': 'ProjectSuccessfulOnboardConfirmAccountAccept'},

                  actionStage = m.prop(actionStages['start']),

                  changeToAction = (stage) => {
                      return () => {
                          actionStage(actionStages[stage]);

                          return void(0);
                      };
                  };

            return {
                changeToAction: changeToAction,
                actionStage: actionStage
            };
        },
        view: (ctrl, args) => {
            const projectAccount = args.projectAccount,
                  actionStage = ctrl.actionStage,
                  personKind = (projectAccount.owner_document.length > 14 ? 'Jurídica' : 'Física');

            return m('.w-container.u-marginbottom-40', [
                m('.u-text-center', [
                    m('.fontsize-large.fontweight-semibold.u-marginbottom-30','Os seus dados estão corretos?')
                ]),
                m('.w-row.u-marginbottom-40', [
                    m('.w-col.w-col-6', [
                        m('.fontsize-base.u-marginbottom-30.card.card-terciary', [
                            m('div', [
                                m('span.fontcolor-secondary', 'Pessoa: '),
                                personKind
                            ]),
                            m('div', [
                                m('span.fontcolor-secondary', 'Nome completo do titular: '),
                                projectAccount.owner_name
                            ]),
                            m('div', [
                                m('span.fontcolor-secondary', 'CPF do titular da conta bancária: '),
                                projectAccount.owner_document
                            ]),
                            m('div', [
                                m('span.fontcolor-secondary', 'Banco: '),
                                projectAccount.bank_name
                            ]),
                            m('div', [
                                m('span.fontcolor-secondary', 'Agência: '),
                                `${projectAccount.agency}${(_.isEmpty(projectAccount.agency_digit) ? '' : `-${projectAccount.agency_digit}`)}`
                            ]),
                            m('div', [
                                m('span.fontcolor-secondary', 'Conta Corrente: '),
                                `${projectAccount.account}-${projectAccount.account_digit}`
                            ])
                        ])
                    ]),
                    m('.w-col.w-col-6', [
                        m('.fontsize-base.u-marginbottom-30.card.card-terciary', [
                            m('div', [
                                m('span.fontcolor-secondary', 'Endereço: '),
                                `${projectAccount.address_street}, ${projectAccount.address_number} ${(!_.isNull(projectAccount.address_complement) ? `, ${projectAccount.address_complement}` : '')}`
                            ]),
                            m('div', [
                                m('span.fontcolor-secondary', 'Bairro: '),
                                projectAccount.address_neighbourhood
                            ]),
                            m('div', [
                                m('span.fontcolor-secondary', 'Cidade: '),
                                projectAccount.address_city
                            ]),
                            m('div', [
                                m('span.fontcolor-secondary', 'Estado: '),
                                projectAccount.address_state
                            ]),
                            m('div', [
                                m('span.fontcolor-secondary', 'CEP: '),
                                projectAccount.address_zip_code
                            ]),
                        ])
                    ])
                ]),
                m.component(c[actionStage()], {
                    projectAccount: projectAccount,
                    changeToAction: ctrl.changeToAction,
                    addErrorReason: args.addErrorReason,
                    acceptAccount: args.acceptAccount
                })
            ]);
        }
    };
}(window.m, window.c, window.c.h, window._));
