/*
    A Mithril.js plugin to authenticate requests against PostgREST
    Copyright (c) 2007 - 2015 Diogo Biazus
    Licensed under the MIT license (http://digitalbush.com/projects/masked-input-plugin/#license)
    Version: 1.0.0
*/
var adminApp = window.adminApp = {
    models: {},
    error: m.prop()
}, ContributionDetail = m.postgrest.model("contribution_details", [ "id", "contribution_id", "user_id", "project_id", "reward_id", "payment_id", "permalink", "project_name", "project_img", "user_name", "user_profile_img", "email", "key", "value", "installments", "installment_value", "state", "anonymous", "payer_email", "gateway", "gateway_id", "gateway_fee", "gateway_data", "payment_method", "project_state", "has_rewards", "pending_at", "paid_at", "refused_at", "reward_minimum_value", "pending_refund_at", "refunded_at", "created_at", "is_second_slip" ]);

adminApp.models.ContributionDetail = ContributionDetail, adminApp.AdminContributions = {
    controller: function(args) {
        var listVM = this.listVM = adminApp.ContributionListVM, filterVM = this.filterVM = adminApp.ContributionFilterVM;
        this.submit = function() {
            return listVM.firstPage(filterVM.parameters()).then(null, function(serverError) {
                adminApp.error(serverError.message);
            }), !1;
        };
    },
    view: function(ctrl) {
        return [ m.component(adminApp.AdminFilter, {
            form: ctrl.filterVM.formDescriber,
            submit: ctrl.submit
        }), adminApp.error() ? m(".card.card-error.u-radius.fontweight-bold", adminApp.error()) : m.component(adminApp.AdminList, {
            vm: ctrl.listVM
        }) ];
    }
};

var vm = adminApp.ContributionFilterVM = m.postgrest.filtersVM({
    full_text_index: "@@",
    state: "eq",
    gateway: "eq",
    value: "between",
    created_at: "between"
});

vm.formDescriber = [ {
    type: "main",
    data: {
        vm: vm.full_text_index,
        placeholder: "Busque por projeto, email, Ids do usuário e do apoio..."
    }
}, {
    type: "dropdown",
    data: {
        label: "Com o estado",
        name: "state",
        vm: vm.state,
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
    type: "dropdown",
    data: {
        label: "gateway",
        name: "gateway",
        vm: vm.gateway,
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
    type: "numberRange",
    data: {
        label: "Valores entre",
        first: vm.value.gte,
        last: vm.value.lte
    }
}, {
    type: "dateRange",
    data: {
        label: "Período do apoio",
        first: vm.created_at.gte,
        last: vm.created_at.lte
    }
} ], vm.state(""), vm.gateway(""), vm.order({
    id: "desc"
}), vm.created_at.lte.toFilter = function() {
    return h.momentFromString(vm.created_at.lte()).endOf("day").format("");
}, vm.created_at.gte.toFilter = function() {
    return h.momentFromString(vm.created_at.gte()).format();
}, vm.full_text_index.toFilter = function() {
    return replaceDiacritics(vm.full_text_index());
}, adminApp.ContributionListVM = m.postgrest.paginationVM(adminApp.models.ContributionDetail.getPageWithToken), 
adminApp.PaymentBadge = {
    controller: function(args) {
        var contribution = args.contribution, card = null;
        return card = function() {
            if (contribution.gateway_data) switch (contribution.gateway.toLowerCase()) {
              case "moip":
                return {
                    first_digits: contribution.gateway_data.cartao_bin,
                    last_digits: contribution.gateway_data.cartao_final,
                    brand: contribution.gateway_data.cartao_bandeira
                };

              case "pagarme":
                return {
                    first_digits: contribution.gateway_data.card_first_digits,
                    last_digits: contribution.gateway_data.card_last_digits,
                    brand: contribution.gateway_data.card_brand
                };
            }
        }, {
            displayPaymentMethod: function() {
                switch (contribution.payment_method.toLowerCase()) {
                  case "boletobancario":
                    return m("span#boleto-detail", "");

                  case "cartaodecredito":
                    var cardData = card();
                    return cardData ? m("#creditcard-detail.fontsize-smallest.fontcolor-secondary.lineheight-tight", [ cardData.first_digits + "******" + cardData.last_digits, m("br"), cardData.brand + " " + contribution.installments + "x" ]) : "";
                }
            }
        };
    },
    view: function(ctrl, args) {
        return m(".fontsize-smallest.fontcolor-secondary.lineheight-tight", [ ctrl.displayPaymentMethod() ]);
    }
}, adminApp.AdminDetail = {
    controller: function(args) {
        this.displayRequestRefundDropDown = adminApp.ToggleDiv.toggler(), this.displayRefundDropDown = adminApp.ToggleDiv.toggler(), 
        this.displayTransferContributionDropDown = adminApp.ToggleDiv.toggler(), this.displayChangeRewardDropDown = adminApp.ToggleDiv.toggler(), 
        this.displatAnonDropDown = adminApp.ToggleDiv.toggler();
    },
    view: function(ctrl, args) {
        var contribution = args.contribution;
        return m("#admin-contribution-detail-box", [ m(".divider.u-margintop-20.u-marginbottom-20"), m(".w-row.u-marginbottom-30.w-hidden", [ m(".w-col.w-col-2", [ m("button.btn.btn-small.btn-terciary", {
            onclick: ctrl.displayRequestRefundDropDown.toggle
        }, "Pedir reembolso"), m.component(adminApp.ToggleDiv, {
            display: ctrl.displayRequestRefundDropDown,
            content: m('.dropdown-list.card.u-radius.dropdown-list-medium.zindex-10[id="transfer"]', [ m(".fontsize-smaller.fontweight-semibold.u-text-center.u-marginbottom-20", "Quer efetuar o reembolso?"), m("button.btn.btn-small", "Solicitar reembolso") ])
        }) ]), m(".w-col.w-col-2", [ m("button.btn.btn-small.btn-terciary", {
            onclick: ctrl.displayRefundDropDown.toggle
        }, "Estornar"), m.component(adminApp.ToggleDiv, {
            display: ctrl.displayRefundDropDown,
            content: m(".dropdown-list.card.u-radius.dropdown-list-medium.zindex-10", [ m(".fontsize-smaller.fontweight-semibold.u-text-center.u-marginbottom-20", "Quer efetuar o estorno?"), m("button.btn.btn-small", "Solicitar estorno") ])
        }) ]), m(".w-col.w-col-2", [ m("button.btn.btn-small.btn-terciary.btn-desactivated", "2a via") ]), m(".w-col.w-col-2", [ m("button.btn.btn-small.btn-terciary", {
            onclick: ctrl.displayTransferContributionDropDown.toggle
        }, "Transferir apoio"), m.component(adminApp.ToggleDiv, {
            display: ctrl.displayTransferContributionDropDown,
            content: m(".dropdown-list.card.u-radius.dropdown-list-medium.zindex-10", [ m(".w-form", [ m("form", [ m("label", "Id do novo apoiador:"), m('input.w-input.text-field[placeholder="ex: 129908"][type="text"]'), m('input.w-button.btn.btn-small[type="submit"][value="Transferir"]') ]) ]) ])
        }) ]), m(".w-col.w-col-2", [ m("button.btn.btn-small.btn-terciary", {
            onclick: ctrl.displayChangeRewardDropDown.toggle
        }, "Trocar recompensa"), m.component(adminApp.ToggleDiv, {
            display: ctrl.displayChangeRewardDropDown,
            content: m('.dropdown-list.card.u-radius.dropdown-list-medium.zindex-10[id="transfer"]', {
                style: {
                    display: "none"
                }
            }, [ m(".w-form", [ m("form", [ m(".w-radio", [ m('input.w-radio-input[type="radio"][value="Radio"]'), m("label.w-form-label", "R$ 10") ]), m(".w-radio", [ m('input.w-radio-input[type="radio"][value="Radio"]'), m('label.w-form-label[for="radio"]', "R$ 10") ]), m(".w-radio", [ m('input.w-radio-input[type="radio"][value="Radio"]'), m("label.w-form-label", "R$ 10") ]), m(".w-radio", [ m('input.w-radio-input[type="radio"][value="Radio"]'), m("label.w-form-label", "R$ 10") ]), m(".w-radio", [ m('input.w-radio-input[type="radio"][value="Radio"]'), m("label.w-form-label", "R$ 10") ]) ]) ]) ])
        }) ]), m(".w-col.w-col-2", [ m("button.btn.btn-small.btn-terciary", {
            onclick: ctrl.displatAnonDropDown.toggle
        }, "Anonimato"), m.component(adminApp.ToggleDiv, {
            display: ctrl.displatAnonDropDown,
            content: m(".dropdown-list.card.u-radius.dropdown-list-medium.zindex-10", [ m(".w-form", [ m("form", [ m(".w-radio", [ m('input.w-radio-input[type="radio"]'), m("label.w-form-label", "Anônimo") ]), m(".w-radio", [ m('input.w-radio-input[type="radio"][value="Radio"]'), m("label.w-form-label", "Público") ]) ]) ]) ])
        }) ]) ]), m(".w-row.card.card-terciary.u-radius", [ m.component(adminApp.AdminTransaction, {
            contribution: contribution
        }), m.component(adminApp.AdminTransactionHistory, {
            contribution: contribution
        }), m.component(adminApp.AdminReward, {
            contribution: contribution,
            key: contribution.key
        }) ]) ]);
    }
}, adminApp.AdminFilter = {
    controller: function() {
        this.toggler = h.toggleProp(!1, !0);
    },
    view: function(ctrl, args) {
        var formBuilder = function(data) {
            return {
                main: m.component(adminApp.filterMain, data),
                dropdown: m.component(adminApp.filterDropdown, data),
                numberRange: m.component(adminApp.filterNumberRange, data),
                dateRange: m.component(adminApp.filterDateRange, data)
            };
        }, main = _.findWhere(args.form, {
            type: "main"
        });
        return m("#admin-contributions-filter.w-section.page-header", [ m(".w-container", [ m(".fontsize-larger.u-text-center.u-marginbottom-30", "Apoios"), m(".w-form", [ m("form", {
            onsubmit: args.submit
        }, [ formBuilder(main.data).main, m(".u-marginbottom-20.w-row", m('button.w-col.w-col-12.fontsize-smallest.link-hidden-light[type="button"][style="background: none; border: none; outline: none; text-align: left;"]', {
            onclick: ctrl.toggler.toggle
        }, "Filtros avançados  >")), ctrl.toggler() ? m("#advanced-search.w-row.admin-filters", [ _.map(args.form, function(f) {
            return "main" !== f.type ? formBuilder(f.data)[f.type] : "";
        }) ]) : "" ]) ]) ]) ]);
    }
}, adminApp.AdminItem = {
    controller: function(args) {
        var userProfile, stateClass, paymentMethodClass, displayDetailBox, contribution = args.contribution;
        return userProfile = function() {
            return contribution.user_profile_img || "/assets/catarse_bootstrap/user.jpg";
        }, stateClass = function() {
            switch (contribution.state) {
              case "paid":
                return ".text-success";

              case "refunded":
                return ".text-refunded";

              case "pending":
                return ".text-waiting";

              default:
                return ".text-error";
            }
        }, paymentMethodClass = function() {
            switch (contribution.payment_method) {
              case "BoletoBancario":
                return ".fa-barcode";

              case "CartaoDeCredito":
                return ".fa-credit-card";

              default:
                return ".fa-question";
            }
        }, displayDetailBox = adminApp.ToggleDiv.toggler(), {
            userProfile: userProfile,
            stateClass: stateClass,
            paymentMethodClass: paymentMethodClass,
            displayDetailBox: displayDetailBox
        };
    },
    view: function(ctrl, args) {
        var contribution = args.contribution;
        return m(".w-clearfix.card.u-radius.u-marginbottom-20.results-admin-contributions", [ m(".w-row", [ m(".w-col.w-col-4", [ m(".w-row", [ m(".w-col.w-col-3.w-col-small-3.u-marginbottom-10", [ m('img.user-avatar[src="' + ctrl.userProfile() + '"]') ]), m(".w-col.w-col-9.w-col-small-9", [ m(".fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-10", [ m('a.alt-link[target="_blank"][href="/users/' + contribution.user_id + '"]', contribution.user_name) ]), m(".fontsize-smallest", "Usuário: " + contribution.user_id), m(".fontsize-smallest.fontcolor-secondary", "Catarse: " + contribution.email), m(".fontsize-smallest.fontcolor-secondary", "Gateway: " + contribution.payer_email) ]) ]) ]), m(".w-col.w-col-4", [ m(".w-row", [ m(".w-col.w-col-3.w-col-small-3.u-marginbottom-10", [ m("img.thumb-project.u-radius[src=" + contribution.project_img + "][width=50]") ]), m(".w-col.w-col-9.w-col-small-9", [ m(".fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-10", [ m('a.alt-link[target="_blank"][href="/' + contribution.permalink + '"]', contribution.project_name) ]), m(".fontsize-smallest.fontweight-semibold", contribution.project_state), m(".fontsize-smallest.fontcolor-secondary", h.momentify(contribution.project_online_date) + " a " + h.momentify(contribution.project_expires_at)) ]) ]) ]), m(".w-col.w-col-2", [ m(".fontweight-semibold.lineheight-tighter.u-marginbottom-10.fontsize-small", "R$" + contribution.value), m(".fontsize-smallest.fontcolor-secondary", h.momentify(contribution.paid_at, "DD/MM/YYYY HH:mm[h]")), m(".fontsize-smallest", [ "ID do Gateway: ", m('a.alt-link[target="_blank"][href="https://dashboard.pagar.me/#/transactions/' + contribution.gateway_id + '"]', contribution.gateway_id) ]) ]), m(".w-col.w-col-2", [ m(".fontsize-smallest.lineheight-looser.fontweight-semibold", [ m("span.fa.fa-circle" + ctrl.stateClass()), " " + contribution.state ]), m(".fontsize-smallest.fontweight-semibold", [ m("span.fa" + ctrl.paymentMethodClass()), " ", m('a.link-hidden[href="#"]', contribution.payment_method) ]), m.component(adminApp.PaymentBadge, {
            contribution: contribution,
            key: contribution.key
        }) ]) ]), m('a.w-inline-block.arrow-admin.fa.fa-chevron-down.fontcolor-secondary[data-ix="show-admin-cont-result"][href="javascript:void(0);"]', {
            onclick: ctrl.displayDetailBox.toggle
        }), m.component(adminApp.ToggleDiv, {
            display: ctrl.displayDetailBox,
            content: m.component(adminApp.AdminDetail, {
                contribution: contribution,
                key: contribution.key
            })
        }) ]);
    }
}, adminApp.AdminList = {
    controller: function(args) {
        !args.vm.collection().length && args.vm.firstPage && args.vm.firstPage().then(null, function(serverError) {
            adminApp.error(serverError.message);
        });
    },
    view: function(ctrl, args) {
        return m(".w-section.section", [ m(".w-container", [ m(".w-row.u-marginbottom-20", [ m(".w-col.w-col-9", [ m(".fontsize-base", [ m("span.fontweight-semibold", args.vm.total()), " apoios encontrados" ]) ]) ]), m("#admin-contributions-list.w-container", [ args.vm.collection().map(function(item, index) {
            return m.component(adminApp.AdminItem, {
                contribution: item,
                key: item.key
            });
        }), m(".w-section.section", [ m(".w-container", [ m(".w-row", [ m(".w-col.w-col-2.w-col-push-5", [ args.vm.isLoading() ? h.loader() : m("button#load-more.btn.btn-medium.btn-terciary", {
            onclick: args.vm.nextPage
        }, "Carregar mais") ]) ]) ]) ]) ]) ]) ]);
    }
}, adminApp.filterDateRange = {
    view: function(ctrl, args) {
        return m(".w-col.w-col-3.w-col-small-6", [ m('label.fontsize-smaller[for="' + args.index + '"]', args.label), m(".w-row", [ m(".w-col.w-col-5.w-col-small-5.w-col-tiny-5", [ m('input.w-input.text-field.positive[id="' + args.index + '"][type="text"]', {
            onchange: m.withAttr("value", args.first),
            value: args.first()
        }) ]), m(".w-col.w-col-2.w-col-small-2.w-col-tiny-2", [ m(".fontsize-smaller.u-text-center.lineheight-looser", "e") ]), m(".w-col.w-col-5.w-col-small-5.w-col-tiny-5", [ m('input.w-input.text-field.positive[type="text"]', {
            onchange: m.withAttr("value", args.last),
            value: args.last()
        }) ]) ]) ]);
    }
}, adminApp.filterDropdown = {
    view: function(ctrl, args) {
        return m(".w-col.w-col-3.w-col-small-6", [ m('label.fontsize-smaller[for="' + args.index + '"]', args.label), m('select.w-select.text-field.positive[id="' + args.index + '"]', {
            onchange: m.withAttr("value", args.vm),
            value: args.vm()
        }, [ _.map(args.options, function(data) {
            return m('option[value="' + data.value + '"]', data.option);
        }) ]) ]);
    }
}, adminApp.filterMain = {
    view: function(ctrl, args) {
        return m(".w-row", [ m(".w-col.w-col-10", [ m('input.w-input.text-field.positive.medium[placeholder="' + args.placeholder + '"][type="text"]', {
            onchange: m.withAttr("value", args.vm),
            value: args.vm()
        }) ]), m(".w-col.w-col-2", [ m('input#filter-btn.btn.btn-large.u-marginbottom-10[type="submit"][value="Buscar"]') ]) ]);
    }
}, adminApp.filterNumberRange = {
    view: function(ctrl, args) {
        return m(".w-col.w-col-3.w-col-small-6", [ m('label.fontsize-smaller[for="' + args.index + '"]', args.label), m(".w-row", [ m(".w-col.w-col-5.w-col-small-5.w-col-tiny-5", [ m('input.w-input.text-field.positive[id="' + args.index + '"][type="text"]', {
            onchange: m.withAttr("value", args.first),
            value: args.first()
        }) ]), m(".w-col.w-col-2.w-col-small-2.w-col-tiny-2", [ m(".fontsize-smaller.u-text-center.lineheight-looser", "e") ]), m(".w-col.w-col-5.w-col-small-5.w-col-tiny-5", [ m('input.w-input.text-field.positive[type="text"]', {
            onchange: m.withAttr("value", args.last),
            value: args.last()
        }) ]) ]) ]);
    }
}, adminApp.AdminTransactionHistory = {
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
        this.orderedEvents = _.sortBy(mapEvents, "originalDate");
    },
    view: function(ctrl, args) {
        args.contribution;
        return m(".w-col.w-col-4", [ m(".fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-20", "Histórico da transação"), ctrl.orderedEvents.map(function(cEvent) {
            return m(".w-row.fontsize-smallest.lineheight-looser.date-event", [ m(".w-col.w-col-6", [ m(".fontcolor-secondary", cEvent.date) ]), m(".w-col.w-col-6", [ m("div", cEvent.name) ]) ]);
        }) ]);
    }
}, adminApp.AdminTransaction = {
    view: function(ctrl, args) {
        var contribution = args.contribution;
        return m(".w-col.w-col-4", [ m(".fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-20", "Detalhes do apoio"), m(".fontsize-smallest.lineheight-looser", [ "Valor: R$" + formatNumber(contribution.value, 2, 3), m("br"), "Taxa: R$" + formatNumber(contribution.gateway_fee, 2, 3), m("br"), "Anônimo: " + (contribution.anonymous ? "Sim" : "Não"), m("br"), "Id pagamento: " + contribution.gateway_id, m("br"), "Apoio: " + contribution.contribution_id, m("br"), "Chave: \n", m("br"), contribution.key, m("br"), "Meio: " + contribution.gateway, m("br"), "Operadora: " + (contribution.gateway_data && contribution.gateway_data.acquirer_name), m("br"), function() {
            return contribution.is_second_slip ? [ m('a.link-hidden[href="#"]', "Boleto bancário"), " ", m("span.badge", "2a via") ] : void 0;
        }() ]) ]);
    }
}, adminApp.AdminReward = {
    view: function(ctrl, args) {
        var reward = args.contribution.reward || {};
        return m(".w-col.w-col-4", [ m(".fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-20", "Recompensa"), m(".fontsize-smallest.lineheight-looser", _.isEmpty(reward) ? "Apoio sem recompensa." : [ "ID: " + reward.id, m("br"), "Valor mínimo: R$" + formatNumber(reward.minimum_value, 2, 3), m("br"), m.trust("Disponíveis: " + reward.paid_count + reward.waiting_payment_count + " / " + (reward.maximum_contributions ? reward.maximum_contributions : "&infin;")), m("br"), "Aguardando confirmação: " + reward.waiting_payment_count, m("br"), "Descrição: " + reward.description ]) ]);
    }
}, adminApp.ToggleDiv = {
    toggler: function() {
        return h.toggleProp("none", "block");
    },
    controller: function(args) {
        this.vm = {
            display: args.display
        };
    },
    view: function(ctrl, args) {
        return m(".toggleDiv", {
            style: {
                transition: "all .1s ease-out",
                overflow: "hidden",
                display: ctrl.vm.display()
            }
        }, [ args.content ]);
    }
};