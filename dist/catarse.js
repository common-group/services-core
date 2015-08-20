/*
    Catarse JS components
    Copyright (c) 2007 - 2015 Diogo Biazus
    Licensed under the MIT license
    Version: 0.0.6
*/
window.c = function() {
    return {
        models: {},
        pages: {},
        admin: {},
        h: {}
    };
}(), window.c.h = function(m, moment) {
    var momentify = function(date, format) {
        return format = format || "DD/MM/YYYY", date ? moment(date).format(format) : "no date";
    }, momentFromString = function(date, format) {
        var european = moment(date, format || "DD/MM/YYYY");
        return european.isValid() ? european : moment(date);
    }, splitRemaningTime = function(date) {
        return moment(date).endOf("day").fromNow().split(/\s/);
    }, generateFormatNumber = function(s, c) {
        return function(number, n, x) {
            if (null === number || void 0 === number) return null;
            var re = "\\d(?=(\\d{" + (x || 3) + "})+" + (n > 0 ? "\\D" : "$") + ")", num = number.toFixed(Math.max(0, ~~n));
            return (c ? num.replace(".", c) : num).replace(new RegExp(re, "g"), "$&" + (s || ","));
        };
    }, formatNumber = generateFormatNumber(".", ","), toggleProp = function(defaultState, alternateState) {
        var p = m.prop(defaultState);
        return p.toggle = function() {
            p(p() === alternateState ? defaultState : alternateState);
        }, p;
    }, loader = function() {
        return m('.u-text-center.u-margintop-30[style="margin-bottom:-110px;"]', [ m('img[alt="Loader"][src="https://s3.amazonaws.com/catarse.files/loader.gif"]') ]);
    };
    return {
        momentify: momentify,
        splitRemaningTime: splitRemaningTime,
        momentFromString: momentFromString,
        formatNumber: formatNumber,
        toggleProp: toggleProp,
        loader: loader
    };
}(window.m, window.moment), window.c.models = function(m) {
    var contributionDetail = m.postgrest.model("contribution_details"), projectDetail = m.postgrest.model("project_details"), teamTotal = m.postgrest.model("team_totals", [ "member_count", "countries", "total_contributed_projects", "total_cities", "total_amount" ]), projectContributionsPerDay = m.postgrest.model("project_contributions_per_day"), teamMember = m.postgrest.model("team_members");
    return teamMember.pageSize(40), {
        contributionDetail: contributionDetail,
        projectDetail: projectDetail,
        teamTotal: teamTotal,
        teamMember: teamMember,
        projectContributionsPerDay: projectContributionsPerDay
    };
}(window.m), window.c.admin.Contributions = function(m, c, h) {
    var admin = c.admin;
    return {
        controller: function() {
            var listVM = admin.contributionListVM, filterVM = admin.contributionFilterVM, error = m.prop(""), itemBuilder = [ {
                component: "AdminUser",
                wrapperClass: ".w-col.w-col-4"
            }, {
                component: "AdminProject",
                wrapperClass: ".w-col.w-col-4"
            }, {
                component: "AdminContribution",
                wrapperClass: ".w-col.w-col-2"
            }, {
                component: "PaymentStatus",
                wrapperClass: ".w-col.w-col-2"
            } ], itemActions = [ {
                component: "AdminInputAction",
                data: {
                    attrName: "user_id",
                    callToAction: "Transferir",
                    innerLabel: "Id do novo apoiador:",
                    outerLabel: "Transferir Apoio",
                    placeholder: "ex: 129908",
                    vm: listVM
                }
            } ], filterBuilder = [ {
                component: "FilterMain",
                data: {
                    vm: filterVM.full_text_index,
                    placeholder: "Busque por projeto, email, Ids do usuário e do apoio..."
                }
            }, {
                component: "FilterDropdown",
                data: {
                    label: "Com o estado",
                    name: "state",
                    vm: filterVM.state,
                    options: [ {
                        value: "",
                        option: "Qualquer um"
                    }, {
                        value: "paid",
                        option: "paid"
                    }, {
                        value: "refused",
                        option: "refused"
                    }, {
                        value: "pending",
                        option: "pending"
                    }, {
                        value: "pending_refund",
                        option: "pending_refund"
                    }, {
                        value: "refunded",
                        option: "refunded"
                    }, {
                        value: "chargeback",
                        option: "chargeback"
                    }, {
                        value: "deleted",
                        option: "deleted"
                    } ]
                }
            }, {
                component: "FilterDropdown",
                data: {
                    label: "gateway",
                    name: "gateway",
                    vm: filterVM.gateway,
                    options: [ {
                        value: "",
                        option: "Qualquer um"
                    }, {
                        value: "Pagarme",
                        option: "Pagarme"
                    }, {
                        value: "MoIP",
                        option: "MoIP"
                    }, {
                        value: "PayPal",
                        option: "PayPal"
                    }, {
                        value: "Credits",
                        option: "Créditos"
                    } ]
                }
            }, {
                component: "FilterNumberRange",
                data: {
                    label: "Valores entre",
                    first: filterVM.value.gte,
                    last: filterVM.value.lte
                }
            }, {
                component: "FilterDateRange",
                data: {
                    label: "Período do apoio",
                    first: filterVM.created_at.gte,
                    last: filterVM.created_at.lte
                }
            } ], submit = function() {
                return listVM.firstPage(filterVM.parameters()).then(null, function(serverError) {
                    error(serverError.message);
                }), !1;
            };
            return {
                filterVM: filterVM,
                filterBuilder: filterBuilder,
                itemActions: itemActions,
                itemBuilder: itemBuilder,
                listVM: {
                    list: listVM,
                    error: error
                },
                submit: submit
            };
        },
        view: function(ctrl) {
            return [ m.component(c.AdminFilter, {
                form: ctrl.filterVM.formDescriber,
                filterBuilder: ctrl.filterBuilder,
                submit: ctrl.submit
            }), m.component(c.AdminList, {
                vm: ctrl.listVM,
                itemBuilder: ctrl.itemBuilder,
                itemActions: ctrl.itemActions
            }) ];
        }
    };
}(window.m, window.c, window.c.h), window.c.admin.contributionFilterVM = function(m, h, replaceDiacritics) {
    var vm = m.postgrest.filtersVM({
        full_text_index: "@@",
        state: "eq",
        gateway: "eq",
        value: "between",
        created_at: "between"
    });
    return vm.state(""), vm.gateway(""), vm.order({
        id: "desc"
    }), vm.created_at.lte.toFilter = function() {
        return h.momentFromString(vm.created_at.lte()).endOf("day").format("");
    }, vm.created_at.gte.toFilter = function() {
        return h.momentFromString(vm.created_at.gte()).format();
    }, vm.full_text_index.toFilter = function() {
        return replaceDiacritics(vm.full_text_index());
    }, vm;
}(window.m, window.c.h, window.replaceDiacritics), window.c.admin.contributionListVM = function(m, models) {
    return m.postgrest.paginationVM(models.contributionDetail.getPageWithToken);
}(window.m, window.c.models), window.c.admin.ProjectInsights = function(m, c, models) {
    return {
        controller: function(args) {
            var vm = m.postgrest.filtersVM({
                project_id: "eq"
            }), projectDetails = m.prop([]), contributionsPerDay = m.prop([]);
            return vm.project_id(args.root.getAttribute("data-id")), models.projectDetail.getRow(vm.parameters()).then(projectDetails), 
            models.projectContributionsPerDay.getRow(vm.parameters()).then(contributionsPerDay), 
            {
                vm: vm,
                projectDetails: projectDetails,
                contributionsPerDay: contributionsPerDay
            };
        },
        view: function(ctrl) {
            return ctrl.projectDetails().map(function(project) {
                return m(".project-insights", [ m(".w-row.u-marginbottom-40", [ m(".w-col.w-col-2"), m(".w-col.w-col-8.dashboard-header.u-text-center", [ m.component(c.AdminProjectDetailsCard, {
                    resource: project
                }), m.component(c.AdminProjectDetailsExplanation, {
                    resource: project
                }) ]), m(".w-col.w-col-2") ]), function(project) {
                    return project.is_published ? [ m(".divider"), m(".w-section.section-one-column.bg-gray.before-footer", [ m(".w-row", [ m(".w-col.w-col-12.dashboard-header.u-text-center", {
                        style: {
                            "min-height": "300px"
                        }
                    }, [ m.component(c.ProjectChartContributionTotalPerDay, {
                        collection: ctrl.contributionsPerDay
                    }) ]) ]), m(".w-row", [ m(".w-col.w-col-12.dashboard-header.u-text-center", {
                        style: {
                            "min-height": "300px"
                        }
                    }, [ m.component(c.ProjectChartContributionAmountPerDay, {
                        collection: ctrl.contributionsPerDay
                    }) ]) ]), m(".w-row", [ m(".w-col.w-col-12.dashboard-header.u-text-center", {
                        style: {
                            "min-height": "300px"
                        }
                    }, [ m.component(c.ProjectReminderCount, {
                        resource: project
                    }) ]) ]) ]) ] : void 0;
                }(project) ]);
            });
        }
    };
}(window.m, window.c, window.c.models), window.c.AdminContribution = function(m, h) {
    return {
        view: function(ctrl, args) {
            var contribution = args.item;
            return m(".w-row.admin-contribution", [ m(".fontweight-semibold.lineheight-tighter.u-marginbottom-10.fontsize-small", "R$" + contribution.value), m(".fontsize-smallest.fontcolor-secondary", h.momentify(contribution.created_at, "DD/MM/YYYY HH:mm[h]")), m(".fontsize-smallest", [ "ID do Gateway: ", m('a.alt-link[target="_blank"][href="https://dashboard.pagar.me/#/transactions/' + contribution.gateway_id + '"]', contribution.gateway_id) ]) ]);
        }
    };
}(window.m, window.c.h), window.c.AdminDetail = function(m, _, c) {
    return {
        controller: function() {},
        view: function(ctrl, args) {
            var actions = args.actions, item = args.item;
            return m("#admin-contribution-detail-box", [ m(".divider.u-margintop-20.u-marginbottom-20"), m(".w-row.u-marginbottom-30", _.map(actions, function(action) {
                return m.component(c[action.component], {
                    data: action.data,
                    item: args.item
                });
            })), m(".w-row.card.card-terciary.u-radius", [ m.component(c.AdminTransaction, {
                contribution: item
            }), m.component(c.AdminTransactionHistory, {
                contribution: item
            }), m.component(c.AdminReward, {
                contribution: item,
                key: item.key
            }) ]) ]);
        }
    };
}(window.m, window._, window.c), window.c.AdminFilter = function(c, m, _, h) {
    return {
        controller: function() {
            return {
                toggler: h.toggleProp(!1, !0)
            };
        },
        view: function(ctrl, args) {
            var filterBuilder = args.filterBuilder, main = _.findWhere(filterBuilder, {
                component: "FilterMain"
            });
            return m("#admin-contributions-filter.w-section.page-header", [ m(".w-container", [ m(".fontsize-larger.u-text-center.u-marginbottom-30", "Apoios"), m(".w-form", [ m("form", {
                onsubmit: args.submit
            }, [ _.findWhere(filterBuilder, {
                component: "FilterMain"
            }) ? m.component(c[main.component], main.data) : "", m(".u-marginbottom-20.w-row", m('button.w-col.w-col-12.fontsize-smallest.link-hidden-light[style="background: none; border: none; outline: none; text-align: left;"][type="button"]', {
                onclick: ctrl.toggler.toggle
            }, "Filtros avançados  >")), ctrl.toggler() ? m("#advanced-search.w-row.admin-filters", [ _.map(filterBuilder, function(f) {
                return "FilterMain" !== f.component ? m.component(c[f.component], f.data) : "";
            }) ]) : "" ]) ]) ]) ]);
        }
    };
}(window.c, window.m, window._, window.c.h), window.c.AdminInputAction = function(m, h, c) {
    return {
        controller: function(args) {
            return {
                toggler: h.toggleProp(!1, !0)
            };
        },
        view: function(ctrl, args) {
            var action = args.data;
            return m(".w-col.w-col-2", [ m("button.btn.btn-small.btn-terciary", {
                onclick: ctrl.toggler.toggle
            }, action.outerLabel), ctrl.toggler() ? m("form.dropdown-list.card.u-radius.dropdown-list-medium.zindex-10", [ m("form.w-form", {
                onsubmit: ctrl.submit
            }, [ m("label", action.outerLabel), m('input.w-input.text-field[type="text"][placeholder="' + action.placeholder + '"]', {
                onchange: m.withAttr("value", action.vm),
                value: action.vm()
            }), m('input.w-button.btn.btn-small[type="submit"][value="' + action.callToAction + '"]') ]) ]) : "" ]);
        }
    };
}(window.m, window.c.h, window.c), window.c.AdminItem = function(m, _, h, c) {
    return {
        controller: function(args) {
            var displayDetailBox = h.toggleProp(!1, !0);
            return {
                displayDetailBox: displayDetailBox
            };
        },
        view: function(ctrl, args) {
            var item = args.item;
            return m(".w-clearfix.card.u-radius.u-marginbottom-20.results-admin-items", [ m(".w-row", [ _.map(args.builder, function(desc) {
                return m(desc.wrapperClass, [ m.component(c[desc.component], {
                    item: item,
                    key: item.key
                }) ]);
            }) ]), m("button.w-inline-block.arrow-admin.fa.fa-chevron-down.fontcolor-secondary", {
                onclick: ctrl.displayDetailBox.toggle
            }), ctrl.displayDetailBox() ? m.component(c.AdminDetail, {
                item: item,
                actions: args.actions,
                key: item.key
            }) : "" ]);
        }
    };
}(window.m, window._, window.c.h, window.c), window.c.AdminList = function(m, h, c) {
    c.admin;
    return {
        controller: function(args) {
            var list = args.vm.list;
            !list.collection().length && list.firstPage && list.firstPage().then(null, function(serverError) {
                args.vm.error(serverError.message);
            });
        },
        view: function(ctrl, args) {
            var list = args.vm.list, error = args.vm.error;
            return m(".w-section.section", [ m(".w-container", error() ? m(".card.card-error.u-radius.fontweight-bold", error()) : [ m(".w-row.u-marginbottom-20", [ m(".w-col.w-col-9", [ m(".fontsize-base", list.isLoading() ? "Buscando apoios..." : [ m("span.fontweight-semibold", list.total()), " apoios encontrados" ]) ]) ]), m("#admin-contributions-list.w-container", [ list.collection().map(function(item) {
                return m.component(c.AdminItem, {
                    builder: args.itemBuilder,
                    actions: args.itemActions,
                    item: item,
                    key: item.key
                });
            }), m(".w-section.section", [ m(".w-container", [ m(".w-row", [ m(".w-col.w-col-2.w-col-push-5", [ list.isLoading() ? h.loader() : m("button#load-more.btn.btn-medium.btn-terciary", {
                onclick: list.nextPage
            }, "Carregar mais") ]) ]) ]) ]) ]) ]) ]);
        }
    };
}(window.m, window.c.h, window.c), window.c.AdminProjectDetailsCard = function(m, h) {
    return {
        controller: function(args) {
            var project = args.resource, statusTextObj = m.prop({});
            switch (project.state) {
              case "online":
                statusTextObj({
                    cssClass: "text-success",
                    text: "NO AR"
                });
                break;

              case "successful":
                statusTextObj({
                    cssClass: "text-success",
                    text: "FINANCIADO"
                });
                break;

              case "failed":
                statusTextObj({
                    cssClass: "text-error",
                    text: "NÃO FINANCIADO"
                });
                break;

              case "waiting_funds":
                statusTextObj({
                    cssClass: "text-waiting",
                    text: "AGUARDANDO"
                });
                break;

              case "rejected":
                statusTextObj({
                    cssClass: "text-error",
                    text: "RECUSADO"
                });
                break;

              case "draft":
                statusTextObj({
                    cssClass: "",
                    text: "RASCUNHO"
                });
                break;

              case "in_analysis":
                statusTextObj({
                    cssClass: "",
                    text: "EM ANÁLISE"
                });
                break;

              case "approved":
                statusTextObj({
                    cssClass: "text-success",
                    text: "APROVADO"
                });
            }
            return {
                project: project,
                statusTextObj: statusTextObj
            };
        },
        view: function(ctrl) {
            var project = ctrl.project, remainingTime = h.splitRemaningTime(project.expires_at), progress = project.progress.toFixed(2), statusTextObj = ctrl.statusTextObj();
            return m(".card.u-radius.card-terciary.u-marginbottom-20", [ m("div", [ m(".fontsize-small.fontweight-semibold", [ m("span.fontcolor-secondary", "Status:"), " ", m("span", {
                "class": statusTextObj.cssClass
            }, statusTextObj.text), " " ]), function() {
                return project.is_published ? [ m(".meter.u-margintop-20.u-marginbottom-10", [ m(".meter-fill", {
                    style: {
                        width: (progress > 100 ? 100 : progress) + "%"
                    }
                }) ]), m(".w-row", [ m(".w-col.w-col-3.w-col-small-3.w-col-tiny-6", [ m(".fontweight-semibold.fontsize-large.lineheight-tight", progress + "%"), m(".fontcolor-secondary.lineheight-tighter.fontsize-small.u-marginbottom-10", "financiado") ]), m(".w-col.w-col-3.w-col-small-3.w-col-tiny-6", [ m(".fontweight-semibold.fontsize-large.lineheight-tight", [ "R$ " + h.formatNumber(project.pledged, 2) ]), m(".fontcolor-secondary.lineheight-tighter.fontsize-small.u-marginbottom-10", "levantados") ]), m(".w-col.w-col-3.w-col-small-3.w-col-tiny-6", [ m(".fontweight-semibold.fontsize-large.lineheight-tight", project.total_contributions), m(".fontcolor-secondary.lineheight-tighter.fontsize-small", "apoios") ]), m(".w-col.w-col-3.w-col-small-3.w-col-tiny-6", [ m(".fontweight-semibold.fontsize-large.lineheight-tight", remainingTime[1]), m(".fontcolor-secondary.lineheight-tighter.fontsize-small", remainingTime[2] + " restantes") ]) ]) ] : void 0;
            }() ]) ]);
        }
    };
}(window.m, window.c.h), window.c.AdminProjectDetailsExplanation = function(m, h) {
    return {
        controller: function(args) {
            var explanation = function(resource) {
                switch (resource.state) {
                  case "online":
                    return m("span", "Você pode receber apoios até 23hs59min59s do dia " + h.momentify(resource.expires_at) + ". Lembre-se, é tudo-ou-nada e você só levará os recursos captados se bater a meta dentro desse prazo.");

                  case "successful":
                    return [ m("span.fontweight-semibold", resource.user.name + ", comemore que você merece!"), " Seu projeto foi bem sucedido e agora é a hora de iniciar o trabalho de relacionamento com seus apoiadores! ", "Atenção especial à entrega de recompensas. Prometeu? Entregue! Não deixe de olhar a seção de pós-projeto do ", m('a.alt-link[href="/guides"]', "Guia dos Realizadores"), " e de informar-se sobre ", m('a.alt-link[href="http://suporte.catarse.me/hc/pt-br/articles/202037493-FINANCIADO-Como-ser%C3%A1-feito-o-repasse-do-dinheiro-"][target="_blank"]', "como o repasse do dinheiro será feito.") ];

                  case "waiting_funds":
                    return [ m("span.fontweight-semibold", resource.user.name + ", estamos processando os últimos pagamentos!"), " Seu projeto foi finalizado em " + h.momentify(resource.expires_at) + " e está aguardando confirmação de boletos e pagamentos. ", "Devido à data de vencimento de boletos, projetos que tiveram apoios de última hora ficam por até 4 dias úteis nesse status, contados a partir da data de finalização do projeto. ", m('a.alt-link[href="http://suporte.catarse.me/hc/pt-br/articles/202037493-FINANCIADO-Como-ser%C3%A1-feito-o-repasse-do-dinheiro-"][target="_blank"]', "Entenda como o repasse de dinheiro é feito para projetos bem sucedidos.") ];

                  case "failed":
                    return [ m("span.fontweight-semibold", resource.user.name + ", não desanime!"), " Seu projeto não bateu a meta e sabemos que isso não é a melhor das sensações. Mas não desanime. ", "Encare o processo como um aprendizado e não deixe de cogitar uma segunda tentativa. Não se preocupe, todos os seus apoiadores receberão o dinheiro de volta. ", m('a.alt-link[href="http://suporte.catarse.me/hc/pt-br/articles/202365507-Regras-e-funcionamento-dos-reembolsos-estornos"][target="_blank"]', "Entenda como fazemos estornos e reembolsos.") ];

                  case "rejected":
                    return [ m("span.fontweight-semibold", resource.user.name + ", infelizmente não foi desta vez."), " Você enviou seu projeto para análise do Catarse e entendemos que ele não está de acordo com o perfil do site. ", "Ter um projeto recusado não impede que você envie novos projetos para avaliação ou reformule seu projeto atual. ", "Converse com nosso atendimento! Recomendamos que você dê uma boa olhada nos ", m('a.alt-link[href="http://suporte.catarse.me/hc/pt-br/articles/202387638-Diretrizes-para-cria%C3%A7%C3%A3o-de-projetos"][target="_blank"]', "critérios da plataforma"), " e no ", m('a.alt-link[href="/guides"]', "guia dos realizadores"), "." ];

                  case "draft":
                    return [ m("span.fontweight-semibold", resource.user.name + ", construa o seu projeto!"), " Quanto mais cuidadoso e bem formatado for um projeto, maiores as chances de ele ser bem sucedido na sua campanha de captação. ", "Antes de enviar seu projeto para a nossa análise, preencha todas as abas ao lado com carinho. Você pode salvar as alterações e voltar ao rascunho de projeto quantas vezes quiser. ", "Quando tudo estiver pronto, clique no botão ENVIAR e entraremos em contato para avaliar o seu projeto." ];

                  case "in_analysis":
                    return [ m("span.fontweight-semibold", resource.user.name + ", você enviou seu projeto para análise em " + h.momentify(resource.sent_to_analysis_at) + " e receberá nossa avaliação em até 4 dias úteis após o envio!"), " Enquanto espera a sua resposta, você pode continuar editando o seu projeto. ", "Recomendamos também que você vá coletando feedback com as pessoas próximas e planejando como será a sua campanha." ];

                  case "approved":
                    return [ m("span.fontweight-semibold", resource.user.name + "Nome do realizador, seu projeto foi aprovado!"), " Para colocar o seu projeto no ar é preciso apenas que você preencha os dados necessários na aba ", m('a.alt-link[href="#user_settings"]', "Conta"), ". É importante saber que cobramos a taxa de 13% do valor total arrecadado apenas por projetos bem sucedidos. Entenda ", m('a.alt-link[href="http://suporte.catarse.me/hc/pt-br/articles/202037493-FINANCIADO-Como-ser%C3%A1-feito-o-repasse-do-dinheiro-"][target="_blank"]', "como fazemos o repasse do dinheiro.") ];
                }
            };
            return {
                explanation: explanation(args.resource)
            };
        },
        view: function(ctrl) {
            return m("p.fontsize-smaller.lineheight-loose", ctrl.explanation);
        }
    };
}(window.m, window.c.h), window.c.AdminProject = function(m, h) {
    return {
        view: function(ctrl, args) {
            var project = args.item;
            return m(".w-row.admin-project", [ m(".w-col.w-col-3.w-col-small-3.u-marginbottom-10", [ m("img.thumb-project.u-radius[src=" + project.project_img + "][width=50]") ]), m(".w-col.w-col-9.w-col-small-9", [ m(".fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-10", [ m('a.alt-link[target="_blank"][href="/' + project.permalink + '"]', project.project_name) ]), m(".fontsize-smallest.fontweight-semibold", project.project_state), m(".fontsize-smallest.fontcolor-secondary", h.momentify(project.project_online_date) + " a " + h.momentify(project.project_expires_at)) ]) ]);
        }
    };
}(window.m, window.c.h), window.c.AdminReward = function(m, h, _) {
    return {
        view: function(ctrl, args) {
            var reward = args.contribution.reward || {}, available = parseInt(reward.paid_count) + parseInt(reward.waiting_payment_count);
            return m(".w-col.w-col-4", [ m(".fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-20", "Recompensa"), m(".fontsize-smallest.lineheight-looser", _.isEmpty(reward) ? "Apoio sem recompensa." : [ "ID: " + reward.id, m("br"), "Valor mínimo: R$" + h.formatNumber(reward.minimum_value, 2, 3), m("br"), m.trust("Disponíveis: " + available + " / " + (reward.maximum_contributions || "&infin;")), m("br"), "Aguardando confirmação: " + reward.waiting_payment_count, m("br"), "Descrição: " + reward.description ]) ]);
        }
    };
}(window.m, window.c.h, window._), window.c.AdminTransactionHistory = function(m, h, _) {
    return {
        controller: function(args) {
            var contribution = args.contribution, mapEvents = _.reduce([ {
                date: contribution.paid_at,
                name: "Apoio confirmado"
            }, {
                date: contribution.pending_refund_at,
                name: "Reembolso solicitado"
            }, {
                date: contribution.refunded_at,
                name: "Estorno realizado"
            }, {
                date: contribution.created_at,
                name: "Apoio criado"
            }, {
                date: contribution.refused_at,
                name: "Apoio cancelado"
            }, {
                date: contribution.deleted_at,
                name: "Apoio excluído"
            }, {
                date: contribution.chargeback_at,
                name: "Chargeback"
            } ], function(memo, item) {
                return null !== item.date && void 0 !== item.date ? (item.originalDate = item.date, 
                item.date = h.momentify(item.date, "DD/MM/YYYY, HH:mm"), memo.concat(item)) : memo;
            }, []);
            return {
                orderedEvents: _.sortBy(mapEvents, "originalDate")
            };
        },
        view: function(ctrl) {
            return m(".w-col.w-col-4", [ m(".fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-20", "Histórico da transação"), ctrl.orderedEvents.map(function(cEvent) {
                return m(".w-row.fontsize-smallest.lineheight-looser.date-event", [ m(".w-col.w-col-6", [ m(".fontcolor-secondary", cEvent.date) ]), m(".w-col.w-col-6", [ m("div", cEvent.name) ]) ]);
            }) ]);
        }
    };
}(window.m, window.c.h, window._), window.c.AdminTransaction = function(m, h) {
    return {
        view: function(ctrl, args) {
            var contribution = args.contribution;
            return m(".w-col.w-col-4", [ m(".fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-20", "Detalhes do apoio"), m(".fontsize-smallest.lineheight-looser", [ "Valor: R$" + h.formatNumber(contribution.value, 2, 3), m("br"), "Taxa: R$" + h.formatNumber(contribution.gateway_fee, 2, 3), m("br"), "Anônimo: " + (contribution.anonymous ? "Sim" : "Não"), m("br"), "Id pagamento: " + contribution.gateway_id, m("br"), "Apoio: " + contribution.contribution_id, m("br"), "Chave: \n", m("br"), contribution.key, m("br"), "Meio: " + contribution.gateway, m("br"), "Operadora: " + (contribution.gateway_data && contribution.gateway_data.acquirer_name), m("br"), function() {
                return contribution.is_second_slip ? [ m('a.link-hidden[href="#"]', "Boleto bancário"), " ", m("span.badge", "2a via") ] : void 0;
            }() ]) ]);
        }
    };
}(window.m, window.c.h), window.c.AdminUser = function(m) {
    return {
        view: function(ctrl, args) {
            var user = args.item, userProfile = function() {
                return user.user_profile_img || "/assets/catarse_bootstrap/user.jpg";
            };
            return m(".w-row.admin-user", [ m(".w-col.w-col-3.w-col-small-3.u-marginbottom-10", [ m('img.user-avatar[src="' + userProfile() + '"]') ]), m(".w-col.w-col-9.w-col-small-9", [ m(".fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-10", [ m('a.alt-link[target="_blank"][href="/users/' + user.user_id + '/edit"]', user.user_name) ]), m(".fontsize-smallest", "Usuário: " + user.user_id), m(".fontsize-smallest.fontcolor-secondary", "Catarse: " + user.email), m(".fontsize-smallest.fontcolor-secondary", "Gateway: " + user.payer_email) ]) ]);
        }
    };
}(window.m), window.c.FilterDateRange = function(m) {
    return {
        view: function(ctrl, args) {
            return m(".w-col.w-col-3.w-col-small-6", [ m('label.fontsize-smaller[for="' + args.index + '"]', args.label), m(".w-row", [ m(".w-col.w-col-5.w-col-small-5.w-col-tiny-5", [ m('input.w-input.text-field.positive[id="' + args.index + '"][type="text"]', {
                onchange: m.withAttr("value", args.first),
                value: args.first()
            }) ]), m(".w-col.w-col-2.w-col-small-2.w-col-tiny-2", [ m(".fontsize-smaller.u-text-center.lineheight-looser", "e") ]), m(".w-col.w-col-5.w-col-small-5.w-col-tiny-5", [ m('input.w-input.text-field.positive[type="text"]', {
                onchange: m.withAttr("value", args.last),
                value: args.last()
            }) ]) ]) ]);
        }
    };
}(window.m), window.c.FilterDropdown = function(m, _) {
    return {
        view: function(ctrl, args) {
            return m(".w-col.w-col-3.w-col-small-6", [ m('label.fontsize-smaller[for="' + args.index + '"]', args.label), m('select.w-select.text-field.positive[id="' + args.index + '"]', {
                onchange: m.withAttr("value", args.vm),
                value: args.vm()
            }, [ _.map(args.options, function(data) {
                return m('option[value="' + data.value + '"]', data.option);
            }) ]) ]);
        }
    };
}(window.m, window._), window.c.FilterMain = function(m) {
    return {
        view: function(ctrl, args) {
            return m(".w-row", [ m(".w-col.w-col-10", [ m('input.w-input.text-field.positive.medium[placeholder="' + args.placeholder + '"][type="text"]', {
                onchange: m.withAttr("value", args.vm),
                value: args.vm()
            }) ]), m(".w-col.w-col-2", [ m('input#filter-btn.btn.btn-large.u-marginbottom-10[type="submit"][value="Buscar"]') ]) ]);
        }
    };
}(window.m), window.c.FilterNumberRange = function(m) {
    return {
        view: function(ctrl, args) {
            return m(".w-col.w-col-3.w-col-small-6", [ m('label.fontsize-smaller[for="' + args.index + '"]', args.label), m(".w-row", [ m(".w-col.w-col-5.w-col-small-5.w-col-tiny-5", [ m('input.w-input.text-field.positive[id="' + args.index + '"][type="text"]', {
                onchange: m.withAttr("value", args.first),
                value: args.first()
            }) ]), m(".w-col.w-col-2.w-col-small-2.w-col-tiny-2", [ m(".fontsize-smaller.u-text-center.lineheight-looser", "e") ]), m(".w-col.w-col-5.w-col-small-5.w-col-tiny-5", [ m('input.w-input.text-field.positive[type="text"]', {
                onchange: m.withAttr("value", args.last),
                value: args.last()
            }) ]) ]) ]);
        }
    };
}(window.m), window.c.PaymentStatus = function(m) {
    return {
        controller: function(args) {
            var displayPaymentMethod, paymentMethodClass, stateClass, payment = args.item, card = null;
            return card = function() {
                if (payment.gateway_data) switch (payment.gateway.toLowerCase()) {
                  case "moip":
                    return {
                        first_digits: payment.gateway_data.cartao_bin,
                        last_digits: payment.gateway_data.cartao_final,
                        brand: payment.gateway_data.cartao_bandeira
                    };

                  case "pagarme":
                    return {
                        first_digits: payment.gateway_data.card_first_digits,
                        last_digits: payment.gateway_data.card_last_digits,
                        brand: payment.gateway_data.card_brand
                    };
                }
            }, displayPaymentMethod = function() {
                switch (payment.payment_method.toLowerCase()) {
                  case "boletobancario":
                    return m("span#boleto-detail", "");

                  case "cartaodecredito":
                    var cardData = card();
                    return cardData ? m("#creditcard-detail.fontsize-smallest.fontcolor-secondary.lineheight-tight", [ cardData.first_digits + "******" + cardData.last_digits, m("br"), cardData.brand + " " + payment.installments + "x" ]) : "";
                }
            }, paymentMethodClass = function() {
                switch (payment.payment_method.toLowerCase()) {
                  case "boletobancario":
                    return ".fa-barcode";

                  case "cartaodecredito":
                    return ".fa-credit-card";

                  default:
                    return ".fa-question";
                }
            }, stateClass = function() {
                switch (payment.state) {
                  case "paid":
                    return ".text-success";

                  case "refunded":
                    return ".text-refunded";

                  case "pending":
                  case "pending_refund":
                    return ".text-waiting";

                  default:
                    return ".text-error";
                }
            }, {
                displayPaymentMethod: displayPaymentMethod,
                paymentMethodClass: paymentMethodClass,
                stateClass: stateClass
            };
        },
        view: function(ctrl, args) {
            var payment = args.item;
            return m(".w-row.payment-status", [ m(".fontsize-smallest.lineheight-looser.fontweight-semibold", [ m("span.fa.fa-circle" + ctrl.stateClass()), " " + payment.state ]), m(".fontsize-smallest.fontweight-semibold", [ m("span.fa" + ctrl.paymentMethodClass()), " ", m('a.link-hidden[href="#"]', payment.payment_method) ]), m(".fontsize-smallest.fontcolor-secondary.lineheight-tight", [ ctrl.displayPaymentMethod() ]) ]);
        }
    };
}(window.m), window.c.ProjectChartContributionAmountPerDay = function(m, Chart, _) {
    return {
        controller: function(args) {
            var resource = args.collection()[0], mountDataset = function() {
                return [ {
                    label: "R$ arrecadados por dia",
                    fillColor: "rgba(126,194,69,0.2)",
                    strokeColor: "rgba(126,194,69,1)",
                    pointColor: "rgba(126,194,69,1)",
                    pointStrokeColor: "#fff",
                    pointHighlightFill: "#fff",
                    pointHighlightStroke: "rgba(220,220,220,1)",
                    data: _.map(resource.source, function(item) {
                        return item.total_amount;
                    })
                } ];
            }, renderChart = function(element, isInitialized) {
                if (!isInitialized) {
                    Object.defineProperty(element, "offsetHeight", {
                        get: function() {
                            return element.height;
                        }
                    }), Object.defineProperty(element, "offsetWidth", {
                        get: function() {
                            return element.width;
                        }
                    });
                    var ctx = element.getContext("2d");
                    new Chart(ctx).Line({
                        labels: _.map(resource.source, function(item) {
                            return item.paid_at;
                        }),
                        datasets: mountDataset()
                    });
                }
            };
            return {
                renderChart: renderChart
            };
        },
        view: function(ctrl) {
            return m(".card.u-radius.medium.u-marginbottom-30", [ m(".fontweight-semibold.u-marginbottom-10.fontsize-large.u-text-center", "R$ arrecadados por dia"), m(".w-row", [ m(".w-col.w-col-12", [ m('canvas[id="chart"][width="860"][height="300"]', {
                config: ctrl.renderChart
            }) ]) ]) ]);
        }
    };
}(window.m, window.Chart, window._), window.c.ProjectChartContributionTotalPerDay = function(m, Chart, _) {
    return {
        controller: function(args) {
            var resource = args.collection()[0], mountDataset = function() {
                return [ {
                    label: "Apoios confirmados por dia",
                    fillColor: "rgba(126,194,69,0.2)",
                    strokeColor: "rgba(126,194,69,1)",
                    pointColor: "rgba(126,194,69,1)",
                    pointStrokeColor: "#fff",
                    pointHighlightFill: "#fff",
                    pointHighlightStroke: "rgba(220,220,220,1)",
                    data: _.map(resource.source, function(item) {
                        return item.total;
                    })
                } ];
            }, renderChart = function(element, isInitialized) {
                if (!isInitialized) {
                    Object.defineProperty(element, "offsetHeight", {
                        get: function() {
                            return element.height;
                        }
                    }), Object.defineProperty(element, "offsetWidth", {
                        get: function() {
                            return element.width;
                        }
                    });
                    var ctx = element.getContext("2d");
                    new Chart(ctx).Line({
                        labels: _.map(resource.source, function(item) {
                            return item.paid_at;
                        }),
                        datasets: mountDataset()
                    });
                }
            };
            return {
                renderChart: renderChart
            };
        },
        view: function(ctrl) {
            return m(".card.u-radius.medium.u-marginbottom-30", [ m(".fontweight-semibold.u-marginbottom-10.fontsize-large.u-text-center", "Apoios confirmados por dia"), m(".w-row", [ m(".w-col.w-col-12", [ m('canvas[id="chart"][width="860"][height="300"]', {
                config: ctrl.renderChart
            }) ]) ]) ]);
        }
    };
}(window.m, window.Chart, window._), window.c.ProjectReminderCount = function(m) {
    return {
        view: function(ctrl, args) {
            var project = args.resource;
            return m(".card.u-radius.u-text-center.medium.u-marginbottom-80", [ m(".fontsize-large.fontweight-semibold", "Total de pessoas que clicaram no botão Lembrar-me"), m(".fontsize-smaller.u-marginbottom-30", "Eles receberão um lembrete por email 48 horas antes do término de sua campanha"), m(".fontsize-jumbo", project.reminder_count) ]);
        }
    };
}(window.m), window.c.TeamMembers = function(_, m, models) {
    return {
        controller: function() {
            var vm = {
                collection: m.prop([])
            }, groupCollection = function(collection, groupTotal) {
                return _.map(_.range(Math.ceil(collection.length / groupTotal)), function(i) {
                    return collection.slice(i * groupTotal, (i + 1) * groupTotal);
                });
            };
            return models.teamMember.getPage().then(function(data) {
                vm.collection(groupCollection(data, 4));
            }), {
                vm: vm
            };
        },
        view: function(ctrl) {
            return m("#team-members-static.w-section.section", [ m(".w-container", [ _.map(ctrl.vm.collection(), function(group) {
                return m(".w-row.u-text-center", [ _.map(group, function(member) {
                    return m(".team-member.w-col.w-col-3.w-col-small-3.w-col-tiny-6.u-marginbottom-40", [ m('a.alt-link[href="/users/' + member.id + '"]', [ m('img.thumb.big.u-round.u-marginbottom-10[src="' + member.img + '"]'), m(".fontweight-semibold.fontsize-base", member.name) ]), m(".fontsize-smallest.fontcolor-secondary", "Apoiou " + member.total_contributed_projects + " projetos") ]);
                }) ]);
            }) ]) ]);
        }
    };
}(window._, window.m, window.c.models), window.c.TeamTotal = function(m, h, models) {
    return {
        controller: function() {
            var vm = {
                collection: m.prop([])
            };
            return models.teamTotal.getRow().then(function(data) {
                vm.collection(data);
            }), {
                vm: vm
            };
        },
        view: function(ctrl) {
            return m("#team-total-static.w-section.section-one-column.u-margintop-40.u-text-center.u-marginbottom-20", [ ctrl.vm.collection().map(function(teamTotal) {
                return m(".w-container", [ m(".w-row", [ m(".w-col.w-col-2"), m(".w-col.w-col-8", [ m(".fontsize-base.u-marginbottom-30", "Hoje somos " + teamTotal.member_count + " pessoas espalhadas por " + teamTotal.total_cities + " cidades em " + teamTotal.countries.length + " países (" + teamTotal.countries.toString() + ")! O Catarse é independente, sem investidores, de código aberto e construído com amor. Nossa paixão é construir um ambiente onde cada vez mais projetos possam ganhar vida."), m(".fontsize-larger.lineheight-tight.text-success", "Nossa equipe, junta, já apoiou R$" + h.formatNumber(teamTotal.total_amount) + " para " + teamTotal.total_contributed_projects + " projetos!") ]), m(".w-col.w-col-2") ]) ]);
            }) ]);
        }
    };
}(window.m, window.c.h, window.c.models), window.c.pages.Team = function(m, c) {
    return {
        view: function() {
            return m("#static-team-app", [ m.component(c.TeamTotal), m.component(c.TeamMembers) ]);
        }
    };
}(window.m, window.c);