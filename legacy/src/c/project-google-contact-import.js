import m from 'mithril';
import prop from 'mithril/stream';
import h from '../h';
import _ from 'underscore';
import { catarse } from '../api';
import models from '../models';
import popNotification from './pop-notification';
import modalBox from './modal-box';
import inviteEmailsFromImport from './invite-emails-from-import';

const projectGoogleContactImport = {
    oninit: function(vnode) {
        const clientId = document.getElementById('google_oauth_client'),
            modalToggle = h.toggleProp(false, true),
            feedPageUrl = 'https://www.google.com/m8/feeds/contacts/default/full?alt=json&max-results=1000',
            dataEmails = prop([]),
            loadingContacts = prop(false),
            fetch = (token, pageUrl) => {
                if (!modalToggle()) {
                    modalToggle.toggle();
                    loadingContacts(true);
                    m.redraw();
                }

                m.request({
                    url: pageUrl || feedPageUrl,
                    dataType: 'jsonp',
                    data: token
                }).then((data) => {
                    const nextLink = _.find(data.feed.link, l => l.rel === 'next'),

                        reducedList = _.reduce(data.feed.entry, (memo, entry) => {
                            if (('gd$email' in entry) && entry.gd$email.length > 0) {
                                const gemails = entry.gd$email,
                                    name = entry.title.$t;

                                _.each(gemails, (email) => {
                                    memo.push({
                                        email: email.address,
                                        name
                                    });
                                });
                            }

                            return memo;
                        }, []);

                    dataEmails(dataEmails().concat(reducedList));

                    if (_.isUndefined(nextLink)) {
                        loadingContacts(false);
                        m.redraw();
                    } else {
                        fetch(token, nextLink.href);
                    }
                });
            },
            auth = () => {
                const config = {
                    client_id: clientId.getAttribute('data-token'),
                    scope: 'https://www.googleapis.com/auth/contacts.readonly'
                };
                gapi.auth.authorize(config, () => {
                    fetch(gapi.auth.getToken());
                });
            };

        return {
            auth,
            modalToggle,
            loadingContacts,
            dataEmails
        };
    },
    view: function(ctrl, args) {
        const project = args.project;

        return m('#google_contact_wrapper', [
            (ctrl.modalToggle() ? m(modalBox, {
                displayModal: ctrl.modalToggle,
                content: [inviteEmailsFromImport, {
                    project: args.project,
                    dataEmails: ctrl.dataEmails,
                    loadingContacts: ctrl.loadingContacts,
                    modalToggle: ctrl.modalToggle,
                    showSuccess: args.showSuccess
                }]
            }) : ''),
            m('a.btn.btn-inline.btn-no-border.btn-terciary.w-inline-block[href=\'javascript:void(0);\']', {
                onclick: ctrl.auth
            }, [
                m('img[src=\'http://uploads.webflow.com/57ba58b4846cc19e60acdd5b/57bc339f77f314e23b94d44d_gmail-icon.png\'][width=\'25\']'),
                m('._w-inline-block.fontsize-smallest', 'Contatos do gmail')
            ])
        ]);
    }
};

export default projectGoogleContactImport;
