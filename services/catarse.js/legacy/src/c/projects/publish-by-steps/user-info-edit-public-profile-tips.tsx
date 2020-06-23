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
                    Apoiadores querem conhecer melhor quem está por trás do projeto. Links que ajudam a contar sua história são sempre bem vindos (seu site, perfis em mídias sociais, alguma matéria legal sobre você, uma entrevista). Procure informar no máximo 3 links, para ficar sucinto!
                    </div>
                    </div>
                </div>
        )
    }
}