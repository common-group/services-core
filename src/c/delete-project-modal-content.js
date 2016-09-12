/**
 * window.c.deleteProjectModalContent component
 * Render delete project modal
 *
 */
import m from 'mithril';
import models from '../models';
import postgrest from 'mithril-postgrest';

const deleteProjectModalContent = {
    controller(args) {
        let l = m.prop(false),
            deleteSuccess = m.prop(false),
            check = m.prop('');

        const deleteProject = () => {
            if (check() === 'deletar-rascunho'){
                let loaderOpts = models.deleteProject.postOptions({
                    _project_id: args.project.project_id
                });
                l = postgrest.loaderWithToken(loaderOpts);
                l.load().then(deleteSuccess(true));

            }
            return false;
        };

        return {
            deleteProject: deleteProject,
            deleteSuccess: deleteSuccess,
            check: check
        };
    },
    view(ctrl, args) {
        const project = args.project;
        return m('div',
                 (ctrl.deleteSuccess() ?  '' : m('.modal-dialog-header',
                  m('.fontsize-large.u-text-center',
                    [
                      'Confirmar ',
                      m('span.fa.fa-trash',
                        ''
                      )
                    ]
                  )
                )),
                m('form.modal-dialog-content',{onsubmit: ctrl.deleteProject},
                  (ctrl.deleteSuccess() ? [m('.fontsize-base.u-margintop-30', 'Projeto deletado com sucesso. Clique no link abaixo para voltar a página inicial.'),
                      m('a.btn.btn-inactive.btn-large.u-margintop-30[href=\'/pt/explore\']', {onclick: () => m.route('/explore')}, 'Voltar')
                  ] :
                  [
                    m('.fontsize-base.u-marginbottom-60',
                      [
                        'O projeto será deletado permanentemente e todos os dados que você preencheu na edição do rascunho não poderão ser recuperados.'
                      ]
                    ),
                    m('.fontsize-base.u-marginbottom-10',
                      [
                        'Confirme escrevendo ',
                        'no campo abaixo ',
                        m('span.fontweight-semibold.text-error',
                          'deletar-rascunho'
                        )
                      ]
                    ),
                    m('.w-form',
                      [
                        m('div',
                          m('input.positive.text-field.u-marginbottom-40.w-input[maxlength=\'256\'][type=\'text\']', {placeholder: 'deletar-rascunho', onchange: m.withAttr('value', ctrl.check)})
                        )
                      ]
                    ),
                    m('div',
                      m('.w-row',
                        [
                          m('.w-col.w-col-3'),
                          m('.u-text-center.w-col.w-col-6',
                            [
                              m('input.btn.btn-inactive.btn-large.u-marginbottom-20[type=\'submit\'][value=\'Deletar para sempre\']'),
                              m('a.fontsize-small.link-hidden-light[href=\'#\']', {onclick: args.displayDeleteModal.toggle}, 'Cancelar'
                              )
                            ]
                          ),
                          m('.w-col.w-col-3')
                        ]
                      )
                    )
                  ])
                )) ;
    }
};

export default deleteProjectModalContent;
