#!/usr/local/bin/node
'use strict';

// receive a complete json with template_vars and notification bodies
// {
//   id: uuid,
//   subject_template: liquid_template_string,
//   content_template: liquid_template_string,
//   template_vars: json object,
//   mail_config: {
//      to: 'email@email.com',
//      from: 'email@email.com',
//      from_name: 'From name',
//      reply_to: 'reply@email.com'
//   }
// }

const getStdin = require('get-stdin');
const R = require('ramda');
const sgMail = require('@sendgrid/mail');
const Liquid = require('liquidjs');
const Raven = require('raven');

if(process.env.SENTRY_DSN) {
    Raven.config(process.env.SENTRY_DSN).install();
};

getStdin().then(str => {
    if(str !== null && str !== "") {
        try {
            const json_message = JSON.parse(str);
            init(json_message)
                .then((ok) => {
                    console.log(ok);
                    process.exitCode = 0;
                    return true;
                })
                .catch((e) => {
                    console.log(e);
                    process.exitCode = 1;
                    return false;
                });
        } catch (e) {
            process.exitCode = 1;
            raven_report(e, {});
            console.log(e);
            return false;
        }
    } else {
        console.log('invalid stdin');
        process.exitCode = 1;
        return false;
    }
});

function raven_report(e, context_opts) {
    if(process.env.SENTRY_DSN) {
        Raven.context(function () {
            if(context_opts) {
                Raven.setContext(context_opts);
            };

            Raven.captureException(e, (sendErr, event) => {
                if(sendErr) {
                    console.log('error on log to sentry')
                } else {
                    console.log('raven logged event', event);
                }
            });
        });
    };
};


async function init(stdin_data) {
    const engine = Liquid();
    console.log('received ', stdin_data);
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const subject_html = await engine.parseAndRender(
        stdin_data.subject_template, stdin_data.template_vars);

    const content_html = await engine.parseAndRender(
        stdin_data.content_template, stdin_data.template_vars);

    let msg = {
        to: (process.env.INTERCEPT_TO ? process.env.INTERCEPT_TO : stdin_data.mail_config.to),
        from: (stdin_data.mail_config.from || process.env.DEFAULT_FROM),
        subject: subject_html,
        html: content_html,
        headers: {
            'x-internal-notificatin-id': stdin_data.id
        }
    };

    if(stdin_data.mail_config.reply_to) {
        msg.reply_to = stdin_data.mail_config.reply_to;
    };

    let sent = sgMail.send(msg);
    sent.then(
        (success) => {
            console.log(success[0].headers['x-message-id']);
            return success[0];
        },
        (failed) => {
            console.log('failed', failed)
            throw failed;
        }
    );
};
