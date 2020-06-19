import m from 'mithril'

export class UserInfoEditPublicProfileTips implements m.Component {
    view({ attrs }) {
        return (
            <div class="dashboard-column-tips internet">
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
                        Quanto você precisa arrecadar para ter sucesso no seu projeto? Defina uma meta coerente com o que seu projeto propõe. Não esqueça de considerar a taxa do Catarse em seu cálculo!
                    </div>
                    </div>
                </div>
        )
    }
}