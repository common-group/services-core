import m from 'mithril'

export class UserInfoEditSettingsTips implements m.Component {
    view({attrs}) {
        return (
            <div class="dashboard-column-tips admin">
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
                        Os dados do responsável pelo projeto precisam ser os mesmos dados do dono da conta bancária que irá receber o dinheiro arrecadado. Esses dados não podem ser alterados após a publicação do projeto!
                    </div>
                </div>
            </div>
        )
    }
}