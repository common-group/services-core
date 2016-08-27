import m from 'mithril';
import h from '../h';
import _ from 'underscore';
import postgrest from 'mithril-postgrest';
import models from '../models';
import popNotification from './pop-notification';

const projectEmailInvite = {
    controller(args) {
        const emailText = m.prop(''),
              loading = m.prop(false),
              project = args.project,
              showSuccess = m.prop(false),

              submitInvite = () => {
                  if(_.isEmpty(emailText()) || loading() === true) {
                  } else {
                      loading(true);
                      const emailList = _.reduce(emailText().split('\n'), (memo, text) => {
                          if(h.validateEmail(text)) {
                              memo.push(text);
                          }
                          return memo;
                      }, []);


                      if(!_.isEmpty(emailList)) {
                          showSuccess(false);
                          postgrest.loaderWithToken(
                              models.inviteProjectEmail.postOptions({
                                  data: {
                                      project_id: project.id,
                                      emails: emailList
                                  }
                              })).load().then((data) => {
                                  emailText('');
                                  loading(false);
                                  showSuccess(true);
                              });
                      } else {
                          loading(false);
                      }
                  }
              };

        return {
            emailText: emailText,
            submitInvite: submitInvite,
            loading: loading,
            showSuccess: showSuccess
        };
    },
    view(ctrl, args) {
        const project = args.project;

        return m('.email-invite-box', [
            (ctrl.showSuccess() ? m.component(popNotification, {message: 'Convites enviados.'}) : ''),
            (ctrl.loading() ? h.loader()
             : [
                 m('.w-form', [
                     m('form', [
                         //m(".u-marginbottom-10.u-text-center", [
                         //    m("a.btn.btn-inline.btn-no-border.btn-terciary.w-inline-block[href='#']", [
                         //        m("img[src='http://uploads.webflow.com/57ba58b4846cc19e60acdd5b/57bc339f77f314e23b94d44d_gmail-icon.png'][width='25']"),
                         //        m("._w-inline-block.fontsize-smallest", "Contatos do gmail")
                         //    ]),
                         //    m("a.btn.btn-inline.btn-no-border.btn-terciary.w-inline-block[href='#']", [
                         //        m("._w-inline-block.fontsize-smallest", "Upload CSV")
                         //    ])
                         //]),
                         m('textarea.positive.text-field.w-input[maxlength="5000"][placeholder="Adicione um ou mais emails, separados por linha."]', {
                             onchange: m.withAttr('value', ctrl.emailText)
                         })
                     ])
                 ]),
                 m('.u-text-center', [
                     m('a.btn.btn-inline.btn-medium.w-button[href="javascript:void(0)"]', {
                         onclick: ctrl.submitInvite,
                         value: ctrl.emailText()
                     }, 'Enviar convites')
                 ])
             ])
        ]);
    }
};

export default projectEmailInvite;
