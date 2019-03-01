import m from 'mithril';
import prop from 'mithril/stream';
import models from '../models';
import { catarse, commonPayment } from '../api';
import _ from 'underscore';
import h from '../h';
import contributionVM from '../vms/contribution-vm';
import inlineError from './inline-error';
import userContributedList from './user-contributed-list';

const userPrivateContributed = {
    oninit: function(vnode) {
        const user_id = vnode.attrs.userId,
            userCommonId = vnode.attrs.user && vnode.attrs.user.common_id,
            subscriptions = commonPayment.paginationVM(models.userSubscription, 'created_at.desc', { Prefer: 'count=exact' }),
            onlinePages = catarse.paginationVM(models.userContribution),
            successfulPages = catarse.paginationVM(models.userContribution),
            failedPages = catarse.paginationVM(models.userContribution),
            error = prop(false),
            loader = prop(true),
            handleError = () => {
                error(true);
                loader(false);
                m.redraw();
            },
            contextVM = catarse.filtersVM({
                user_id: 'eq',
                state: 'in',
                project_state: 'in'
            }),
            contextSubVM = catarse.filtersVM({
                user_id: 'eq',
                status: 'in'
            });

        models.userSubscription.pageSize(9);
        models.userContribution.pageSize(9);

        contextSubVM.user_id(userCommonId).status(['started', 'active', 'inactive', 'canceled', 'canceling', 'error']).order({
            created_at: 'desc'
        });

        subscriptions.firstPage(contextSubVM.parameters()).then(() => {
            loader(false);
        }).catch(handleError);

        contextVM.order({ created_at: 'desc' }).user_id(user_id).state(['refunded', 'pending_refund', 'paid', 'refused', 'pending']);

        contextVM.project_state(['online', 'waiting_funds']);
        onlinePages.firstPage(contextVM.parameters()).then(() => {
            loader(false);
        }).catch(handleError);

        contextVM.project_state(['failed']);
        failedPages.firstPage(contextVM.parameters()).then(() => {
            loader(false);
        }).catch(handleError);

        contextVM.project_state(['successful']).state(['paid', 'refunded', 'pending_refund']);
        successfulPages.firstPage(contextVM.parameters()).then(() => {
            loader(false);
        }).catch(handleError);

        vnode.state = {
            subscriptions,
            onlinePages,
            successfulPages,
            failedPages,
            error,
            loader
        };
    },
    onbeforeupdate: function(vnode) { },
    view: function({state, attrs}) {
        const subsCollection = state.subscriptions.collection(),
            onlineCollection = state.onlinePages.collection(),
            successfulCollection = state.successfulPages.collection(),
            failedCollection = state.failedPages.collection();

        return m('.content[id=\'private-contributed-tab\']', state.error() ? m(inlineError, {
            message: 'Erro ao carregar os projetos.'
        }) : state.loader() ? h.loader() :
            (_.isEmpty(subsCollection) && _.isEmpty(onlineCollection) && _.isEmpty(successfulCollection) && _.isEmpty(failedCollection)) ?
            m('.w-container',
                m('.w-row.u-margintop-30.u-text-center', [
                    m('.w-col.w-col-3'),
                    m('.w-col.w-col-6', [
                        m('.fontsize-large.u-marginbottom-30', [
                            'Você ainda não apoiou nenhum projeto no',
                            m.trust('&nbsp;'),
                            'Catarse...'
                        ]),
                        m('.w-row', [
                            m('.w-col.w-col-3'),
                            m('.w-col.w-col-6',
                                m(`a.btn.btn-large[href=\'/${window.I18n.locale}/explore\']`, {
                                    oncreate: m.route.link,
                                    onclick: () => {
                                        m.route.set('/explore');
                                    }
                                },
                                    'Apoie agora!'
                                )
                            ),
                            m('.w-col.w-col-3')
                        ])
                    ]),
                    m('.w-col.w-col-3')
                ])
            ) :
            [
                m(userContributedList, {
                    title: 'Assinaturas',
                    collection: subsCollection,
                    isSubscription: true,
                    pagination: state.subscriptions
                }),
                m(userContributedList, {
                    title: 'Projetos em andamento',
                    collection: onlineCollection,
                    pagination: state.onlinePages
                }),
                m(userContributedList, {
                    title: 'Projetos bem-sucedidos',
                    collection: successfulCollection,
                    pagination: state.successfulPages
                }),
                m(userContributedList, {
                    title: 'Projetos não-financiados',
                    collection: failedCollection,
                    pagination: state.failedPages,
                    hideSurveys: true
                }),

            ]);
    }
};

export default userPrivateContributed;
