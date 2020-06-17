import m from 'mithril'

export class RewardsEditTips implements m.Component {
    view({ attrs }) {
        return (
            <div class="dashboard-column-tips">
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
                    <div class="fontsize-smaller u-marginbottom-20">
                        Para arrecadar o máximo em sua campanha, lembre-se de:
                    </div>
                    <div class="fontsize-smaller u-marginbottom-10">
                        <span class="fa fa-check fa-fw" aria-hidden="true"></span>
                        &nbsp;Descreva quem irá se beneficiar
                    </div>
                    <div class="fontsize-smaller u-marginbottom-10">
                        <span class="fa fa-check fa-fw" aria-hidden="true"></span>
                        &nbsp;Dê detalhes de como o dinheiro será usado
                    </div>
                    <div class="fontsize-smaller u-marginbottom-10">
                        <span class="fa fa-check fa-fw" aria-hidden="true"></span>
                        &nbsp;Explique a urgência da sua causa
                    </div>
                    <div class="fontsize-smaller u-marginbottom-10">
                        <span class="fa fa-check fa-fw" aria-hidden="true"></span>
                        &nbsp;Conte para as pessoas o que o suporte delas irá representar para você
                    </div>
                    <div class="fontsize-smaller u-marginbottom-10">
                        <span class="fa fa-check fa-fw" aria-hidden="true"></span>
                        &nbsp;Compartilhe o quão feliz você ficará com o apoio das pessoas
                    </div>
                </div>
            </div>
        )
    }
}