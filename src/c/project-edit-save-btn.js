import m from 'mithril';
import _ from 'underscore';
import h from '../h';
import railsErrorsVM from '../vms/rails-errors-vm';

const projectEditSaveBtn = {
    controller(args) {
        const validatePublish = () => {
            const currentProject = h.getCurrentProject();
            if (_.isEmpty(railsErrorsVM.railsErrors())) { return false; }
            return m.request({
                method: 'GET',
                url: `/projects/${currentProject.project_id}/validate_publish`,
                config: h.setCsrfToken
            }).then(() => { railsErrorsVM.setRailsErrors(''); }).catch((err) => {
                railsErrorsVM.setRailsErrors(err.errors_json);
                m.redraw();
            });
        };
        return { validatePublish };
    },
    view(ctrl, args) {
        return m('.w-section.save-draft-btn-section', [
            m('.w-row', [
                m('.w-col.w-col-4.w-col-push-4',
                  (args.loading() ? h.loader() : [
                      m('input[id="anchor"][name="anchor"][type="hidden"][value="about_me"]'),
                      m('input.btn.btn.btn-large[name="commit"][type="submit"][value="Salvar"]', {
                          onclick: () => { args.onSubmit(); ctrl.validatePublish(); }
                      })
                  ])
                 ),
                m('.w-col.w-col-4')
            ])
        ]);
    }
};

export default projectEditSaveBtn;
