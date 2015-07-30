/*
    A Mithril.js plugin to authenticate requests against PostgREST
    Copyright (c) 2007 - 2015 Diogo Biazus
    Licensed under the MIT license (http://digitalbush.com/projects/masked-input-plugin/#license)
    Version: 1.0.0
*/
var adminApp = window.adminApp = {
    models: {},
    error: m.prop()
}, momentify = function(date, format) {
    return format = format || "DD/MM/YYYY", date ? moment(date).format(format) : "no date";
}, momentFromString = function(date, format) {
    var european = moment(date, format || "DD/MM/YYYY");
    return european.isValid() ? european : moment(date);
}, generateFormatNumber = function(s, c) {
    return function(number, n, x) {
        if (null == number || void 0 == number) return null;
        var re = "\\d(?=(\\d{" + (x || 3) + "})+" + (n > 0 ? "\\D" : "$") + ")", num = number.toFixed(Math.max(0, ~~n));
        return (c ? num.replace(".", c) : num).replace(new RegExp(re, "g"), "$&" + (s || ","));
    };
}, formatNumber = generateFormatNumber(".", ","), toggleProp = function(defaultState, alternateState) {
    var p = m.prop(defaultState);
    return p.toggle = function() {
        p(p() === alternateState ? defaultState : alternateState);
    }, p;
}, loader = function() {
    return m("img[alt='Loader'][src='/assets/catarse_bootstrap/loader-eff2ad1eeb09a19c9afb5b143e1dd62b.gif']");
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
        dataset: [ {
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
        dataset: [ {
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
} ], vm.state(""), vm.gateway(""), vm.created_at.lte.toFilter = function() {
    return momentFromString(vm.created_at.lte()).endOf("day").format();
}, vm.created_at.gte.toFilter = function() {
    return momentFromString(vm.created_at.gte()).format();
}, adminApp.ContributionListVM = m.postgrest.paginationVM(adminApp.models.ContributionDetail.getPageWithToken), 
adminApp.PaymentBadge = {
    view: function(ctrl, args) {
        var contribution = args.contribution;
        return m(".fontsize-smallest.fontcolor-secondary.lineheight-tight", [ function() {
            switch (contribution.payment_method.toLowerCase()) {
              case "boletobancario":
                return m("span#boleto-detail", "");

              case "cartaodecredito":
                return m("#creditcard-detail.fontsize-smallest.fontcolor-secondary.lineheight-tight", [ contribution.card_first_digits + "******" + contribution.card_last_digits, m("br"), contribution.card_brand + " " + contribution.installments + "x" ]);
            }
        }() ]);
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
            content: m(".dropdown-list.card.u-radius.dropdown-list-medium.zindex-10[data-ix='display-none-on-load'][id='transfer']", [ m(".fontsize-smaller.fontweight-semibold.u-text-center.u-marginbottom-20", "Quer efetuar o reembolso?"), m("a.btn.btn-small[href='#']", "Solicitar reembolso") ])
        }) ]), m(".w-col.w-col-2", [ m("button.btn.btn-small.btn-terciary", {
            onclick: ctrl.displayRefundDropDown.toggle
        }, "Estornar"), m.component(adminApp.ToggleDiv, {
            display: ctrl.displayRefundDropDown,
            content: m(".dropdown-list.card.u-radius.dropdown-list-medium.zindex-10", [ m(".fontsize-smaller.fontweight-semibold.u-text-center.u-marginbottom-20", "Quer efetuar o estorno?"), m("a.btn.btn-small[href='#']", "Solicitar estorno") ])
        }) ]), m(".w-col.w-col-2", [ m("button.btn.btn-small.btn-terciary.btn-desactivated[href='#']", "2a via") ]), m(".w-col.w-col-2", [ m("button.btn.btn-small.btn-terciary", {
            onclick: ctrl.displayTransferContributionDropDown.toggle
        }, "Transferir apoio"), m.component(adminApp.ToggleDiv, {
            display: ctrl.displayTransferContributionDropDown,
            content: m(".dropdown-list.card.u-radius.dropdown-list-medium.zindex-10", [ m(".w-form", [ m("form[data-name='Email Form 4'][id='email-form-4'][name='email-form-4']", [ m("label[for='name-2']", "Id do novo apoiador:"), m("input.w-input.text-field[data-name='Name 2'][id='name-2'][name='name'][placeholder='ex: 129908'][type='text']"), m("input.w-button.btn.btn-small[data-wait='Please wait...'][type='submit'][value='Transferir']") ]) ]) ])
        }) ]), m(".w-col.w-col-2", [ m("button.btn.btn-small.btn-terciary", {
            onclick: ctrl.displayChangeRewardDropDown.toggle
        }, "Trocar recompensa"), m.component(adminApp.ToggleDiv, {
            display: ctrl.displayChangeRewardDropDown,
            content: m(".dropdown-list.card.u-radius.dropdown-list-medium.zindex-10[data-ix='display-none-on-load'][id='transfer']", {
                style: {
                    display: " none"
                }
            }, [ m(".w-form", [ m("form[data-name='Email Form 4'][id='email-form-4'][name='email-form-4']", [ m(".w-radio", [ m("input.w-radio-input[data-name='Radio'][id='radio'][name='radio'][type='radio'][value='Radio']"), m("label.w-form-label[for='radio']", "R$ 10") ]), m(".w-radio", [ m("input.w-radio-input[data-name='Radio 2'][id='radio'][name='radio-2'][type='radio'][value='Radio']"), m("label.w-form-label[for='radio']", "R$ 10") ]), m(".w-radio", [ m("input.w-radio-input[data-name='Radio 2'][id='radio'][name='radio-2'][type='radio'][value='Radio']"), m("label.w-form-label[for='radio']", "R$ 10") ]), m(".w-radio", [ m("input.w-radio-input[data-name='Radio 2'][id='radio'][name='radio-2'][type='radio'][value='Radio']"), m("label.w-form-label[for='radio']", "R$ 10") ]), m(".w-radio", [ m("input.w-radio-input[data-name='Radio 2'][id='radio'][name='radio-2'][type='radio'][value='Radio']"), m("label.w-form-label[for='radio']", "R$ 10") ]) ]) ]) ])
        }) ]), m(".w-col.w-col-2", [ m("button.btn.btn-small.btn-terciary", {
            onclick: ctrl.displatAnonDropDown.toggle
        }, "Anonimato"), m.component(adminApp.ToggleDiv, {
            display: ctrl.displatAnonDropDown,
            content: m(".dropdown-list.card.u-radius.dropdown-list-medium.zindex-10", [ m(".w-form", [ m("form[data-name='Email Form 4'][id='email-form-4'][name='email-form-4']", [ m(".w-radio", [ m("input.w-radio-input[data-name='Radio'][id='radio'][name='radio'][type='radio'][value='Radio']"), m("label.w-form-label[for='radio']", "Anônimo") ]), m(".w-radio", [ m("input.w-radio-input[data-name='Radio 2'][id='radio'][name='radio-2'][type='radio'][value='Radio']"), m("label.w-form-label[for='radio']", "Público") ]) ]) ]) ])
        }) ]) ]), m(".w-row.card.card-terciary.u-radius", [ m.component(adminApp.AdminTransaction, {
            contribution: contribution
        }), m.component(adminApp.AdminTransactionHistory, {
            contribution: contribution
        }), m(".w-col.w-col-4") ]) ]);
    }
}, adminApp.AdminFilter = {
    controller: function() {
        this.toggler = toggleProp(!1, !0);
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
        this.contribution = args.contribution, this.contribution.user_profile_img = this.contribution.user_profile_img || "/assets/catarse_bootstrap/user.jpg", 
        this.CSSsuccess = ".text-success", this.CSSwaiting = ".text-waiting", this.CSSerror = ".text-error", 
        this.paymentDetails = function() {
            if (this.contribution.gateway = this.contribution.gateway.toLowerCase(), !this.contribution.gateway_data) return !1;
            switch (this.contribution.gateway) {
              case "moip":
                return this.contribution.card_first_digits = this.contribution.gateway_data.cartao_bin, 
                this.contribution.card_last_digits = this.contribution.gateway_data.cartao_final, 
                this.contribution.card_brand = this.contribution.gateway_data.cartao_bandeira, this.contribution.installments = this.contribution.gateway_data.parcelas, 
                !0;

              case "pagarme":
                return this.contribution.card_first_digits = this.contribution.gateway_data.card_first_digits, 
                this.contribution.card_last_digits = this.contribution.gateway_data.card_last_digits, 
                this.contribution.card_brand = this.contribution.gateway_data.card_brand, this.contribution.installments = this.contribution.gateway_data.installments, 
                !0;

              default:
                return !1;
            }
        }, this.stateClass = function() {
            switch (this.contribution.state) {
              case "paid":
                return this.CSSsuccess;

              case "refunded":
                return this.CSSsuccess;

              case "pending":
                return this.CSSwaiting;

              default:
                return this.CSSerror;
            }
        }, this.paymentMethodClass = function() {
            switch (this.contribution.payment_method) {
              case "BoletoBancario":
                return ".fa-barcode";

              case "CartaoDeCredito":
                return ".fa-credit-card";

              default:
                return ".fa-question";
            }
        }, this.displayDetailBox = adminApp.ToggleDiv.toggler();
    },
    view: function(ctrl, args) {
        var contribution = ctrl.contribution;
        return m(".w-clearfix.card.u-radius.u-marginbottom-20.results-admin-contributions", [ m(".w-row", [ m(".w-col.w-col-4", [ m(".w-row", [ m(".w-col.w-col-3.w-col-small-3.u-marginbottom-10", [ m("img.user-avatar[src='" + contribution.user_profile_img + "']") ]), m(".w-col.w-col-9.w-col-small-9", [ m(".fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-10", [ m("a.alt-link[target='_blank'][href='/users/" + contribution.user_id + "']", contribution.user_name) ]), m(".fontsize-smallest", "Usuário: " + contribution.user_id), m(".fontsize-smallest.fontcolor-secondary", "Catarse: " + contribution.email), m(".fontsize-smallest.fontcolor-secondary", "Gateway: " + contribution.payer_email) ]) ]) ]), m(".w-col.w-col-4", [ m(".w-row", [ m(".w-col.w-col-3.w-col-small-3.u-marginbottom-10", [ m("img.thumb-project.u-radius[src=" + contribution.project_img + "][width=50]") ]), m(".w-col.w-col-9.w-col-small-9", [ m(".fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-10", [ m("a.alt-link[target='_blank'][href='/" + contribution.permalink + "']", contribution.project_name) ]), m(".fontsize-smallest.fontweight-semibold", contribution.project_state), m(".fontsize-smallest.fontcolor-secondary", momentify(contribution.project_online_date) + " a " + momentify(contribution.project_expires_at)) ]) ]) ]), m(".w-col.w-col-2", [ m(".fontweight-semibold.lineheight-tighter.u-marginbottom-10.fontsize-small", "R$" + contribution.value), m(".fontsize-smallest.fontcolor-secondary", momentify(contribution.paid_at, "DD/MM/YYYY hh:mm[h]")), m(".fontsize-smallest", [ "ID do Gateway: ", m("a.alt-link[target='_blank'][href='https://dashboard.pagar.me/#/transactions/" + contribution.gateway_id + "']", contribution.gateway_id) ]) ]), m(".w-col.w-col-2", [ m(".fontsize-smallest.lineheight-looser.fontweight-semibold", [ m("span.fa.fa-circle" + ctrl.stateClass()), " " + contribution.state ]), m(".fontsize-smallest.fontweight-semibold", [ m("span.fa" + ctrl.paymentMethodClass()), " ", m("a.link-hidden[href='#']", contribution.payment_method) ]), ctrl.paymentDetails() ? m.component(adminApp.PaymentBadge, {
            contribution: contribution
        }) : "" ]) ]), m("a.w-inline-block.arrow-admin.fa.fa-chevron-down.fontcolor-secondary[data-ix='show-admin-cont-result'][href='javascript:void(0);']", {
            onclick: ctrl.displayDetailBox.toggle
        }), m.component(adminApp.ToggleDiv, {
            display: ctrl.displayDetailBox,
            content: m.component(adminApp.AdminDetail, {
                contribution: contribution
            })
        }) ]);
    }
}, adminApp.AdminList = {
    controller: function(args) {
        args.vm.collection().length || args.vm.firstPage().then(null, function(serverError) {
            adminApp.error(serverError.message);
        });
    },
    view: function(ctrl, args) {
        return m(".w-section.section", [ m(".w-container", [ m(".w-row.u-marginbottom-20", [ m(".w-col.w-col-9", [ m(".fontsize-base", [ m("span.fontweight-semibold", args.vm.total()), " apoios encontrados" ]) ]) ]), m("#admin-contributions-list.w-container", [ args.vm.collection().map(function(item) {
            return m.component(adminApp.AdminItem, {
                contribution: item,
                key: item
            });
        }), m(".w-section.section", [ m(".w-container", [ m(".w-row", [ m(".w-col.w-col-2.w-col-push-5", [ args.vm.isLoading() ? loader() : m("button#load-more.btn.btn-medium.btn-terciary", {
            onclick: args.vm.nextPage
        }, "Carregar mais") ]) ]) ]) ]) ]) ]) ]);
    }
}, adminApp.filterDateRange = {
    view: function(ctrl, args) {
        return m(".w-col.w-col-3.w-col-small-6", [ m('label.fontsize-smaller[for="field-7"]', args.label), m(".w-row", [ m(".w-col.w-col-5.w-col-small-5.w-col-tiny-5", [ m('input.w-input.text-field.positive[name="field-5"][type="text"]', {
            onchange: m.withAttr("value", args.first),
            value: args.first()
        }) ]), m(".w-col.w-col-2.w-col-small-2.w-col-tiny-2", [ m(".fontsize-smaller.u-text-center.lineheight-looser", "e") ]), m(".w-col.w-col-5.w-col-small-5.w-col-tiny-5", [ m('input.w-input.text-field.positive[name="field-5"][type="text"]', {
            onchange: m.withAttr("value", args.last),
            value: args.last()
        }) ]) ]) ]);
    }
}, adminApp.filterDropdown = {
    view: function(ctrl, args) {
        return m(".w-col.w-col-3.w-col-small-6", [ m('label.fontsize-smaller[for="' + args.name + '"]', args.label), m('select.w-select.text-field.positive[name="' + args.name + '"]', {
            onchange: m.withAttr("value", args.vm),
            value: args.vm()
        }, [ _.map(args.dataset, function(data) {
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
        return m(".w-col.w-col-3.w-col-small-6", [ m('label.fontsize-smaller[for="field-6"]', args.label), m(".w-row", [ m(".w-col.w-col-5.w-col-small-5.w-col-tiny-5", [ m('input.w-input.text-field.positive[name="field-5"][type="text"]', {
            onchange: m.withAttr("value", args.first),
            value: args.first()
        }) ]), m(".w-col.w-col-2.w-col-small-2.w-col-tiny-2", [ m(".fontsize-smaller.u-text-center.lineheight-looser", "e") ]), m(".w-col.w-col-5.w-col-small-5.w-col-tiny-5", [ m('input.w-input.text-field.positive[name="field-5"][type="text"]', {
            onchange: m.withAttr("value", args.last),
            value: args.last()
        }) ]) ]) ]);
    }
}, adminApp.AdminTransaction = {
    view: function(ctrl, args) {
        var contribution = args.contribution;
        return m(".w-col.w-col-4", [ m(".fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-20", "Detalhes do apoio"), m(".fontsize-smallest.lineheight-looser", [ "Valor: R$" + formatNumber(contribution.value, 2, 3), m("br"), "Taxa: R$" + formatNumber(contribution.gateway_fee, 2, 3), m("br"), "Recompensa: " + formatNumber(contribution.reward_minimum_value, 2, 3), m("br"), "Anônimo: " + (contribution.anonymous ? "Sim" : "Não"), m("br"), "Id pagamento: " + contribution.gateway_id, m("br"), "Apoio: " + contribution.contribution_id, m("br"), "Chave: \n", m("br"), contribution.key, m("br"), "Meio: " + contribution.gateway, m("br"), "Operadora: " + (contribution.gateway_data && contribution.gateway_data.acquirer_name), m("br"), function() {
            return contribution.is_second_slip ? [ m("a.link-hidden[href='#']", "Boleto bancário"), " ", m("span.badge", "2a via") ] : void 0;
        }() ]) ]);
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
        } ], function(memo, item) {
            return null != item.date && void 0 != item.date ? (item.originalDate = item.date, 
            item.date = momentify(item.date, "DD/MM/YYYY, HH:mm"), memo.concat(item)) : memo;
        }, []);
        this.orderedEvents = _.sortBy(mapEvents, "originalDate");
    },
    view: function(ctrl, args) {
        args.contribution;
        return m(".w-col.w-col-4", [ m(".fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-20", "Histórico da transação"), ctrl.orderedEvents.map(function(cEvent) {
            return m(".w-row.fontsize-smallest.lineheight-looser.date-event", [ m(".w-col.w-col-6", [ m(".fontcolor-secondary", cEvent.date) ]), m(".w-col.w-col-6", [ m("div", cEvent.name) ]) ]);
        }) ]);
    }
}, adminApp.ToggleDiv = {
    toggler: function() {
        return toggleProp("none", "block");
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