#!/usr/local/bin/node
'use strict';

// receive a complete json with template_vars and notification bodies
// {
//   id: uuid,
//   mail_config: {
//      to: 'email@email.com',
//      from: 'email@email.com',
//      from_name: 'From name',
//      reply_to: 'reply@email.com'
//   }
// }

const {Pool} = require('pg');
const getStdin = require('get-stdin');
const R = require('ramda');
const sgMail = require('@sendgrid/mail');
const Liquid = require('liquidjs');
const Raven = require('raven');

if(process.env.SENTRY_DSN) {
    Raven.config(process.env.SENTRY_DSN).install();
};

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    statement_timeout: (process.env.STATEMENT_TIMEOUT || 5000),
    max: 3
});

getStdin().then(str => {
    if(str !== null && str !== "") {
        try {
            const json_message = JSON.parse(str);
            init(json_message)
                .then((ok) => {
                    console.log(ok);
                    process.exitCode = 0;
                    process.exit(0);
                    return true;
                })
                .catch((e) => {
                    console.log('errrr', e);
                    process.exitCode = 1;
                    process.exit(1);
                    return false;
                });
        } catch (e) {
            process.exitCode = 1;
            raven_report(e, {});
            console.log(e);
            process.exit(1);
            return false;
        }
    } else {
        console.log('invalid stdin');
        process.exitCode = 1;
        process.exit(1);
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
    const client = await pool.connect();
    const engine = Liquid();
    console.log('received stdin data: ', stdin_data);
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const res = await client.query(
        `select
            row_to_json(n.*) as notification_data,
            row_to_json(ngt.*) as notification_global_template_data,
            row_to_json(nt.*) as notification_template_data,
            notification_service._generate_template_vars_from_relations((n.data ->> 'relations')::json) as template_vars
        from notification_service.notifications n
            left join notification_service.notification_global_templates ngt on ngt.id = n.notification_global_template_id
            left join notification_service.notification_templates nt on nt.id = n.notification_template_id
            where n.id = $1::uuid`
        , [stdin_data.id]);

    const notification = res.rows[0].notification_data;
    const notification_global_template = res.rows[0].notification_global_template_data;
    const notification_template = res.rows[0].notification_template_data;
    const template_vars = res.rows[0].template_vars;

    const subject_template = notification_template && notification_template.id ? notification_template.subject : notification_global_template.subject;
    const content_template = notification_template && notification_template.id ? notification_template.template : notification_global_template.template;
    console.log(subject_template);
    console.log(content_template);


    const subject_html = await engine.parseAndRender(
        subject_template, template_vars);

    const content_html = await engine.parseAndRender(
        content_template, template_vars);

    let msg = {
        to: (process.env.INTERCEPT_TO ? process.env.INTERCEPT_TO : stdin_data.mail_config.to),
        from: (stdin_data.mail_config.from || process.env.DEFAULT_FROM),
        fromname: (stdin_data.mail_config.from_name || process.env.DEFAULT_FROM_NAME),
        subject: subject_html,
        html: content_html,
        headers: {
            'x-internal-notificatin-id': stdin_data.id
        }
    };

    if(stdin_data.mail_config.reply_to) {
        msg.reply_to = stdin_data.mail_config.reply_to;
    };

    try {
        let sent = await sgMail.send(msg);
        console.log(sent);
    } catch (e) {
        throw e;
    }
    
    // sent.then(
    //     (success) => {
    //         console.log(success[0].headers['x-message-id']);
    //         return success[0];
    //     },
    //     (failed) => {
    //         console.log('failed', failed)
    //         throw failed;
    //     }
    // );
};
