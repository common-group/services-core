import m from 'mithril';
import models from '../models';
import postgrest from 'mithril-postgrest';
import _ from 'underscore';
import h from '../h';
import contributionVM from '../vms/contribution-vm';
import inlineError from './inline-error';
import userContributedBox from './user-contributed-box';

const userPrivateContributed = {
    controller(args) {
        const user_id = args.userId,
            onlinePages = postgrest.paginationVM(models.userContribution),
            successfulPages = postgrest.paginationVM(models.userContribution),
            failedPages = postgrest.paginationVM(models.userContribution),
            error = m.prop(false),
            loader = m.prop(true),
            handleError = () => {
                error(true);
                loader(false);
                m.redraw();
            },
            contextVM = postgrest.filtersVM({
                user_id: 'eq',
                state: 'in',
                project_state: 'in'
            });

        models.userContribution.pageSize(9);
        contextVM.user_id(user_id).order({
            created_at: 'desc'
        }).state(['refunded', 'pending_refund', 'paid', 'refused', 'pending']);

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

        return {
            onlinePages,
            successfulPages,
            failedPages,
            error,
            loader
        };
    },
    view(ctrl, args) {
        const onlineCollection = ctrl.onlinePages.collection(),
            successfulCollection = ctrl.successfulPages.collection(),
            failedCollection = ctrl.failedPages.collection();

        return m('.content[id=\'private-contributed-tab\']', ctrl.error() ? m.component(inlineError, {
            message: 'Erro ao carregar os projetos.'
        }) : ctrl.loader() ? h.loader() :
            (_.isEmpty(onlineCollection) && _.isEmpty(successfulCollection) && _.isEmpty(failedCollection)) ?
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
                                m('a.btn.btn-large[href=\'/pt/explore\']', {
                                    config: m.route,
                                    onclick: () => {
                                        m.route('/explore');
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
                m.component(userContributedBox, {
                    title: 'Projetos em andamento',
                    collection: onlineCollection,
                    pagination: ctrl.onlinePages
                }),
                m.component(userContributedBox, {
                    title: 'Projetos bem-sucedidos',
                    collection: successfulCollection,
                    pagination: ctrl.successfulPages
                }),
                m.component(userContributedBox, {
                    title: 'Projetos não-financiados',
                    collection: failedCollection,
                    pagination: ctrl.failedPages
                }),

            ]);
    }
};

export default userPrivateContributed;
