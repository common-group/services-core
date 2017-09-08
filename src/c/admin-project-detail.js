import m from 'mithril';
import _ from 'underscore';
import postgrest from 'mithril-postgrest';
import h from '../h';
import models from '../models';
import adminInputAction from './admin-input-action';
import adminRadioAction from './admin-radio-action';
import adminExternalAction from './admin-external-action';

const adminProjectDetail = {
    controller(args) {
        let bankl;
        const loadBank = () => {
            const model = models.projectAccount,
                project_id = args.item.project_id,
                opts = model.getRowOptions(h.idVM.id(project_id).parameters()),
                project = m.prop({});

            bankl = postgrest.loaderWithToken(opts);

            if (project_id) {
                bankl.load().then(_.compose(project, _.first));
            }

            return project;
        };
        let l;
        const loadUser = () => {
            const model = models.userDetail,
                user_id = args.item.user_id,
                opts = model.getRowOptions(h.idVM.id(user_id).parameters()),
                user = m.prop({});

            l = postgrest.loaderWithToken(opts);

            if (user_id) {
                l.load().then(_.compose(user, _.first));
            }

            return user;
        };

        return {
            user: loadUser(),
            bankAccount: loadBank(),
            actions: {
                refund: {
                    updateKey: 'id',
                    callToAction: 'Reembolso direto',
                    innerLabel: 'Tem certeza que deseja reembolsar esse apoio?',
                    outerLabel: 'Reembolsar Apoio',
                    model: models.contributionDetail
                },
                remove: {
                    property: 'state',
                    updateKey: 'id',
                    callToAction: 'Apagar',
                    innerLabel: 'Tem certeza que deseja apagar esse apoio?',
                    outerLabel: 'Apagar Apoio',
                    forceValue: 'deleted',
                    successMessage: 'Apoio removido com sucesso!',
                    errorMessage: 'O apoio não foi removido!',
                    model: models.contributionDetail
                }
            },
            l
        };
    },
    view(ctrl, args) {
        const actions = ctrl.actions,
            item = args.item,
            user = ctrl.user(),
            bankAccount = ctrl.bankAccount(),
            userAddress = user.address || {},
            addOptions = (builder, id) => _.extend({}, builder, {
                requestOptions: {
                    url: (`/admin/contributions/${id}/gateway_refund`),
                    method: 'PUT'
                }
            });

        return m('#admin-contribution-detail-box', [
            m('.divider.u-margintop-20.u-marginbottom-20'),
            m('.w-row.u-marginbottom-30', [
                (ctrl.l()) ? h.loader :
                m.component(adminExternalAction, {
                    data: addOptions(actions.refund, item.id),
                    item
                }),
                m.component(adminInputAction, {
                    data: actions.remove,
                    item
                })
            ]),
            m('.w-row.card.card-terciary.u-radius', [
                m('.w-col.w-col-4', [
                    m('.fontsize-smaller.fontweight-semibold.lineheight-tighter.u-marginbottom-20',
                        'Detalhes do projeto'
                    ),
                    m('.fontsize-smallest.fontweight-semibold.u-marginbottom-20',
                        `catarse.me/${item.permalink}`
                    ),
                    m('.fontsize-smallest.lineheight-looser.u-marginbottom-20', [
                        m('span.fontweight-semibold',
                            'Meta:'
                        ),
                        ` R$ ${h.formatNumber(item.goal, 2, 3)}\ `,
                        m('br'),
                        m('span.fontweight-semibold',
                            'Alcançado:'
                        ),
                        ` R$ ${h.formatNumber(item.pledged, 2, 3)}\ `,
                        m('br'),
                        m('span.fontweight-semibold',
                            'Taxa do MP:'
                        ),
                        ' R$ 341\ ',
                        m('br'),
                        m('span.fontweight-semibold',
                            'Taxa do Catarse:'
                        ),
                        ' R$ 1.055'
                    ]),
                    m('.fontsize-smallest.lineheight-looser', [
                        m('span.fontweight-semibold',
                            'Início: '
                        ),
                        h.momentify(item.project_online_date, 'DD/MM/YYYY, HH:mm'),
                        m('br'),
                        m('span.fontweight-semibold',
                            'Término: '
                        ),
                        h.momentify(item.project_expires_at, 'DD/MM/YYYY, HH:mm'),
                        m('br'),
                        // m('span.fontweight-semibold',
                            // 'Prazo de entrega:'
                        // ),
                        // ' 30/11/2015\ ',
                        // m('br'),
                        m('span.fontweight-semibold',
                            'Últ. atualização: '
                        ),
                        h.momentify(item.updated_at, 'DD/MM/YYYY, HH:mm'),
                        m('br'),
                        m('span.fontweight-semibold',
                            'Novidades: '
                        ),
                        item.posts_count,
                        m('br'),
                        m('span.fontweight-semibold',
                            'Últ. novidade: '
                        ),
                        h.momentify(item.last_post, 'DD/MM/YYYY, HH:mm')
                    ])
                ]),
                m('.w-col.w-col-4', [
                    m('.fontsize-smaller.fontweight-semibold.lineheight-tighter.u-marginbottom-20',
                        'Dados bancários'
                    ),
                    m('.fontsize-smallest.lineheight-looser.u-marginbottom-20', [
                        m('span.fontweight-semibold',
                            'Valor do repasse:'
                        ),
                        m.trust('&nbsp;'),
                        'R$ 15050',
                        m('br'),
                        m('span.fontweight-semibold',
                            'Data do repasse:'
                        ),
                        m.trust('&nbsp;'),
                        '20/01/2015'
                    ]),
                    m('.fontsize-smallest.lineheight-looser', [
                        m('span.fontweight-semibold',
                            'Banco: '
                        ),
                        bankAccount.bank_name,
                        m('br'),
                        m('span.fontweight-semibold',
                            'Agencia: '
                        ),
                        `${bankAccount.agency}-${bankAccount.agency_digit}`,
                        m('br'),
                        m('span.fontweight-semibold',
                            'Conta: '
                        ),
                        `${bankAccount.account}-${bankAccount.account_digit}`,
                        m('br'),
                        bankAccount.account_type,
                        m('br'),
                        m('span.fontweight-semibold',
                            'Nome: '
                        ),
                        bankAccount.owner_name,
                        m('br'),
                        m('span.fontweight-semibold',
                            'CPF: '
                        ),
                        bankAccount.owner_document
                    ])
                ]),
                m('.w-col.w-col-4', [
                    m('.fontsize-smaller.fontweight-semibold.lineheight-tighter.u-marginbottom-20',
                        'Detalhes do realizador'
                    ),
                    m('.fontsize-smallest.lineheight-looser.u-marginbottom-20', [
                        m('span.fontweight-semibold',
                            'Nome: '
                        ),
                        user.name,
                        m('br'),
                        m('span.fontweight-semibold',
                            'CPF: '
                        ),
                        user.owner_document,
                        m('br'),
                        m('span.fontweight-semibold',
                            'Inscrição estadual: '
                        ),
                        user.state_inscription,
                        m('br'),
                        m('span.fontweight-semibold',
                            'Email: '
                        ),
                        user.email,
                        m('br'),
                        m('span.fontweight-semibold',
                            'Endereço: '
                        ),
                        m.trust('&nbsp;'),
                        ` ${userAddress.address_street}, ${userAddress.address_number} ${userAddress.address_complement} - ${userAddress.address_city} - ${userAddress.address_state} ${userAddress.address_zip_code}`,
                        m('br'),
                        m('span.fontweight-semibold',
                            'Telefone:'
                        ),
                        userAddress.phone_number
                    ]),
                    m('.fontsize-smallest.lineheight-looser', [
                        `${user.total_published_projects} projetos criados `,
                        m('br'),
                        m.trust('&nbsp;'),
                        m('br')
                    ])
                ])
            ])
        ]);
    }
};

export default adminProjectDetail;
