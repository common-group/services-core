/**
 * window.c.ProjectSuccessfulOnboardConfirmAccount component
 * render project account data to confirm or add error
 *
 * Example:
 * m.component(c.ProjectSuccessfulOnboardConfirmAccount, {projectAccount: projectAccount})
 **/

window.c.ProjectSuccessfulOnboardConfirmAccount = ((m, c, h, _, I18n) => {
    const I18nScope = _.partial(h.i18nScope, 'projects.successful_onboard.confirm_account');

    return {
        controller: (args) => {
            const actionStages = {
                      'start': 'ProjectSuccessfulOnboardConfirmAccountActions',
                      'error': 'ProjectSuccessfulOnboardConfirmAccountError',
                      'accept': 'ProjectSuccessfulOnboardConfirmAccountAccept'
                  },
                  currentStage = m.prop('start'),
                  actionStage = () => actionStages[currentStage()],
                  changeToAction = (stage) => {
                      return () => {
                          currentStage(stage);

                          return false;
                      };
                  };

            return {
                changeToAction: changeToAction,
                actionStage: actionStage,
                currentStage: currentStage
            };
        },
        view: (ctrl, args) => {
            const projectAccount = args.projectAccount,
                  actionStage = ctrl.actionStage,
                  currentStage = ctrl.currentStage,
                  personKind = (projectAccount.owner_document.length > 14 ? I18n.t('person.juridical', I18nScope()) : I18n.t('person.natural', I18nScope()));

            return m('.w-container.u-marginbottom-40', [
                m('.u-text-center', [
                    m('.fontsize-large.fontweight-semibold.u-marginbottom-30', I18n.t('title', I18nScope()))
                ]),
                m('.w-row.u-marginbottom-40', [
                    m('.w-col.w-col-6', [
                        m('.fontsize-base.u-marginbottom-30.card.card-terciary', [
                            m('div', [
                                m('span.fontcolor-secondary', I18n.t('person.label', I18nScope())),
                                personKind
                            ]),
                            m('div', [
                                m('span.fontcolor-secondary', I18n.t('person.name', I18nScope())),
                                projectAccount.owner_name
                            ]),
                            m('div', [
                                m('span.fontcolor-secondary', I18n.t('person.document', I18nScope())),
                                projectAccount.owner_document
                            ]),
                            m('div', [
                                m('span.fontcolor-secondary', I18n.t('person.bank.name', I18nScope())),
                                projectAccount.bank_name
                            ]),
                            m('div', [
                                m('span.fontcolor-secondary', I18n.t('person.bank.agency', I18nScope())),
                                `${projectAccount.agency}${(_.isEmpty(projectAccount.agency_digit) ? '' : `-${projectAccount.agency_digit}`)}`
                            ]),
                            m('div', [
                                m('span.fontcolor-secondary', I18n.t('person.bank.account', I18nScope())),
                                `${projectAccount.account}-${projectAccount.account_digit}`
                            ])
                        ])
                    ]),
                    m('.w-col.w-col-6', [
                        m('.fontsize-base.u-marginbottom-30.card.card-terciary', [
                            m('div', [
                                m('span.fontcolor-secondary', I18n.t('person.address', I18nScope())),
                                `${projectAccount.address_street}, ${projectAccount.address_number} ${(!_.isNull(projectAccount.address_complement) ? `, ${projectAccount.address_complement}` : '')}`
                            ]),
                            m('div', [
                                m('span.fontcolor-secondary', I18n.t('person.neighbourhood', I18nScope())),
                                projectAccount.address_neighbourhood
                            ]),
                            m('div', [
                                m('span.fontcolor-secondary', I18n.t('person.city', I18nScope())),
                                projectAccount.address_city
                            ]),
                            m('div', [
                                m('span.fontcolor-secondary', I18n.t('person.state', I18nScope())),
                                projectAccount.address_state
                            ]),
                            m('div', [
                                m('span.fontcolor-secondary', I18n.t('person.zip_code', I18nScope())),
                                projectAccount.address_zip_code
                            ]),
                        ])
                    ])
                ]),
                (currentStage() === 'start') ? m('.w-row.bank-transfer-answer', [
                    m('.w-col.w-col-3.w-col-small-6.w-col-tiny-6.w-hidden-small.w-hidden-tiny'),
                    m('.w-col.w-col-3.w-col-small-6.w-col-tiny-6', [
                        m('a.btn.btn-large', {href: '#confirm_account', onclick: ctrl.changeToAction('accept')}, 'Sim')
                    ]),
                    m('.w-col.w-col-3.w-col-small-6.w-col-tiny-6', [
                        m('a.btn.btn-large.btn-terciary', {href: '#error_account', onclick: ctrl.changeToAction('error')}, 'Não')
                    ]),
                    m('.w-col.w-col-3.w-col-small-6.w-col-tiny-6.w-hidden-small.w-hidden-tiny')
                ]) : m.component(c[actionStage()], {
                    projectAccount: projectAccount,
                    changeToAction: ctrl.changeToAction,
                    addErrorReason: args.addErrorReason,
                    acceptAccount: args.acceptAccount,
                    acceptAccountLoader: args.acceptAccountLoader
                })
            ]);
        }
    };
}(window.m, window.c, window.c.h, window._, window.I18n));
