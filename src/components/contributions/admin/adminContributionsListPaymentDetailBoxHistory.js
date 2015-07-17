adminApp.AdminContributionsListPaymentDetailBoxHistory = {
  view: function(ctrl, args) {
    var contribution = args.contribution;
    return m(".w-col.w-col-4",[
      m(".fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-20", "Histórico da transação"),
      m(".w-row.fontsize-smallest.lineheight-looser",[
        m(".w-col.w-col-6",[
          m(".fontcolor-secondary", "19/05/2015, 01:20 h")
        ]),
        m(".w-col.w-col-6",[
          m("div", "Apoio criado")
        ])
      ]),
      m(".w-row.fontsize-smallest.lineheight-looser",[
        m(".w-col.w-col-6",[
          m(".fontcolor-secondary", "19/05/2015, 01:20 h")
        ]),
        m(".w-col.w-col-6",[
          m("div", "Apoio criado")
        ])
      ]),
      m(".w-row.fontsize-smallest.lineheight-looser",[
        m(".w-col.w-col-6",[
          m(".fontcolor-secondary", "19/05/2015, 01:20 h")
        ]),
        m(".w-col.w-col-6",[
          m("div",[
            m("span.badge.badge-attention.fontsize-smallest", "Estorno realizado")
          ])
        ])
      ]),
      m(".w-row.fontsize-smallest.lineheight-looser",[
        m(".w-col.w-col-6",[
          m(".fontcolor-secondary", "19/05/2015, 01:20 h")
        ]),
        m(".w-col.w-col-6",[
          m("div", "Apoio criado")
        ])
      ]),
      m(".w-row.fontsize-smallest.lineheight-looser",[
        m(".w-col.w-col-6",[
          m(".fontcolor-secondary", "19/05/2015, 01:20 h")
        ]),
        m(".w-col.w-col-6",[
          m("div", "Apoio criado")
        ])
      ]),
      m(".w-row.fontsize-smallest.lineheight-looser",[
        m(".w-col.w-col-6",[
          m(".fontcolor-secondary", "19/05/2015, 01:20 h")
        ]),
        m(".w-col.w-col-6",[
          m("div", "Apoio criado"),
          m(".fontsize-smallest.lineheight-tighter",[
            m("span.badge", "Luis Otavio Ribeiro")
          ])
        ])
      ])
    ])
  }
}


