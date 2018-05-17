/**
 * window.c.projectReportNoRewardReceived component
 * Render project report form
 *
 */
import m from 'mithril';
import h from '../h';
import _ from 'underscore';
import ownerMessageContent from './owner-message-content';
import modalBox from './modal-box';

const projectReportNoRewardReceived = {
    controller(args) {
        const formName = 'report-no-reward-received';
        const displayModal = h.toggleProp(false, true);
        const storeId = 'send-message';
        const sendMessage = () => {
            if (!h.getUser()) {
                h.storeAction(storeId, args.project.project_id);
                return h.navigateToDevise();
            }

            displayModal(true);
        };

        if (h.callStoredAction(storeId) == args.project().project_id) {
            displayModal(true);
        }

        return {
            displayModal,
            sendMessage,
            formName: args.formName || formName
        };
    },
    view(ctrl, args) {
        const contactModalC = [ownerMessageContent, m.prop(_.extend(args.user, {
            project_id: args.project().id
        }))];

        return m('.card.u-radius.u-margintop-20',
                 [
                     (ctrl.displayModal() ? m.component(modalBox, {
                         displayModal: ctrl.displayModal,
                         content: contactModalC
                     }) : ''),
	                   m('.w-form', 
		                   m('form',
			                   [
				                     m('.report-option.w-radio',
					                     [
						                       m('input.w-radio-input[type=\'radio\']', {
                                       value: ctrl.formName,
                                       checked: args.displayFormWithName() === ctrl.formName,
                                       onchange: m.withAttr('value', args.displayFormWithName)
                                   }),
						                       m('label.fontsize-small.fontweight-semibold.w-form-label',{
                                       onclick: _ => args.displayFormWithName(ctrl.formName)
                                   }, 'Apoiei este projeto e ainda não recebi a recompensa')
					                     ]
				                      ),
				                     m('.u-margintop-30', {
                                 style: {
                                     display: args.displayFormWithName() === ctrl.formName ? 'block' : 'none'
                                 }
                             },
					                     m('.fontsize-small',
						                     [
							                       'Para saber sobre a de entrega da sua recompensa, você pode enviar uma',
							                       m('a.alt-link', {
                                         style: {
                                             cursor: 'pointer'
                                         },
                                         onclick: h.analytics.event({
                                             cat: 'project_view',
                                             act: 'project_creator_sendmsg',
                                             lbl: args.user.id,
                                             project: args.project()
                                         }, ctrl.sendMessage),
                                         text:' mensagem diretamente para o(a) Realizador(a)'
                                     }),
							                       '.',
							                       m('br'),
							                       m('br'),
							                       'Veja',
							                       m('a.alt-link', {
                                         href: 'https://suporte.catarse.me/hc/pt-br/articles/360000149946-Ainda-n%C3%A3o-recebi-minha-recompensa-E-agora-',
                                         target: '_blank'
                                     }, ' aqui '),
							                       'outras dicas sobre como acompanhar essa entrega.'
						                     ]
					                      )
				                      )
			                   ]
		                    )
	                    )
                 ]);
    }
};

export default projectReportNoRewardReceived;
