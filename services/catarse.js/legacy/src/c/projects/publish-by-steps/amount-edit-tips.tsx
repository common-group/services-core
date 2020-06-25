import m from 'mithril'

type AmountEditTipsAttrs = {
    show: boolean
}

export class AmountEditTips implements m.Component {
    view({ attrs } : m.Vnode<AmountEditTipsAttrs>) {

        const show = attrs.show

        return (
            <div class='dashboard-column-tips amount' style={`display: ${show ? 'block' : 'none'}`}>
                <div class="card card-secondary">
                    <div>
                        <div class="arrow-left"></div>
                        <img src="https://uploads-ssl.webflow.com/57ba58b4846cc19e60acdd5b/57ba58b4846cc19e60acde14_Screen%20Shot%202015-06-28%20at%2011.51.22%20AM.png" alt="" class="thumb small u-round u-right" />
                        <div class="fontsize-smallest">
                            Dicas do Rafa, nosso especialista
                        </div>
                    </div>
                </div>
                <div class="card">
                    <div class="fontsize-smallest">
                        Quanto você precisa arrecadar para ter sucesso no seu projeto? Defina uma meta coerente com o que seu projeto propõe e não esqueça de considerar a taxa do Catarse quando for definir sua meta!
                    </div>
                </div>
            </div>
        )
    }
}