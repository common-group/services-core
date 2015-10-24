window.c.landingSignup = (function(m, h) {
    return {
        controller: (args) => {
            const builder = args.builder,
                email = m.prop(''),
                submit = () => {
                    console.log('Will Signup ', email());
                };
            return {
                email: email,
                submit: submit
            };
        },
        view: (ctrl, args) => {
            return m('form.w-form[id=\'email-form\']', {
                    onsubmit: ctrl.submit
                },[
                    m('.w-col.w-col-5', [
                        m('input.w-input.text-field.medium[name="email"][placeholder="Digite seu email"][type="text"]', {
                            onchange: m.withAttr('value', ctrl.email),
                            value: ctrl.email()
                        })
                    ]),
                    m('.w-col.w-col-3', [
                        m('input.w-editable.w-button.btn.btn-large[type="submit"][value="Cadastrar"]')
                    ])
                ]
            );
        }
    };
}(window.m, window.c.h));
