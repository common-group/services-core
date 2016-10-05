import m from 'mithril';
import _ from 'underscore';
import I18n from 'i18n-js';
import h from '../h';
import facebookButton from '../c/facebook-button';
import projectShareBox from '../c/project-share-box';
import projectRow from '../c/project-row';

const I18nScope = _.partial(h.i18nScope, 'projects.contributions');

const thankYou = {
controller (args) {
    return {
        displayShareBox: h.toggleProp(false, true)
    };
},
view (ctrl, args) {

return m('#thank-you', [
  m(".page-header.u-marginbottom-30",
      	m(".w-container",
      		m(".w-row",
                m(".w-col.w-col-10.w-col-push-1",
  					[
  						m(".u-marginbottom-20.u-text-center",
  							m(`img.big.thumb.u-round[src='${args.contribution.project.user_thumb}']`)
  						),
  						m(".u-text-center", !args.contribution.slip_url ?
  							[
  								m(".fontsize-larger.text-success.u-marginbottom-20",
  									I18n.t('thank_you', I18nScope())
  								),
  								m(".fontsize-base.u-marginbottom-40",
  									m.trust(
                                        I18n.t('thank_you.thank_you_text_html',
                                            I18nScope({
                                                total: args.contribution.project.total_contributions,
                                                email: args.contribution.contribution_email,
                                                link2: `/pt/users/${h.getUser().user_id}/edit#contributions`
                                            })
                                        )
                                    )
  								),
  								m(".fontsize-base.fontweight-semibold.u-marginbottom-20",
  									"Compartilhe com seus amigos e ajude esse projeto a bater a meta!"
  								)
  							] : ''
  						),
  						m(".w-row",
                            [
                                m(".w-hidden-small.w-hidden-tiny",
          							[
                                        m('.w-sub-col.w-col.w-col-4', m.component(facebookButton, {
                                            url: `https://www.catarse.me/${args.contribution.project.permalink}?ref=ctrse_thankyou&utm_source=facebook.com&utm_medium=social&utm_campaign=project_share`,
                                            big: true
                                        })),
                                        m('.w-sub-col.w-col.w-col-4', m.component(facebookButton, {
                                            messenger: true,
                                            big: true,
                                            url: `https://www.catarse.me/${args.contribution.project.permalink}?ref=ctrse_thankyou&utm_source=facebook.com&utm_medium=messenger&utm_campaign=thanks_share`
                                        })),
                                        m('.w-col.w-col-4', m('a.btn.btn-large.btn-tweet.u-marginbottom-20[href="http://twitter.com/?status=Acabei%20de%20apoiar%20o%20projeto%20' + args.contribution.project.name + '%20https://www.catarse.me/' + args.contribution.project.permalink + '%3Fref%3Dtwitter%26utm_source%3Dtwitter.com%26utm_medium%3Dsocial%26utm_campaign%3Dproject_share"][target="_blank"]', [
                                            m('span.fa.fa-twitter'), ' Twitter'
                                        ]))
          							]
                                ),
                                m(".w-hidden-main.w-hidden-medium", [
                                    m('.u-marginbottom-30.u-text-center-small-only', m('button.btn.btn-large.btn-terciary.u-marginbottom-40', {
                                        onclick: ctrl.displayShareBox.toggle
                                    }, 'Compartilhe')),
                                    ctrl.displayShareBox() ? m(projectShareBox, {
                                        // Mocking a project m.prop
                                        project: m.prop({
                                            permalink: args.contribution.project.permalink,
                                            name: args.contribution.project.name
                                        }),
                                        displayShareBox: ctrl.displayShareBox
                                    }) : ''
                                ])
                            ]
  						),
  					]
  				)

      		)
      	)
    ),
    m(".section.u-marginbottom-40",
        m(".w-container",
            args.contribution.slip_url ? m('iframe', {src: args.contribution.slip_url}) : [
                m('.fontsize-large.fontweight-semibold.u-marginbottom-30.u-text-center',
                    I18n.t('project_recommendations', I18nScope())
                ),
                m.component(projectRow, {
                    collection: args.contribution.recommended_projects.projectContributions,
                    ref: `ctrse_thankyou_r`
                })
            ]
        )
    )

    // <div class="section u-marginbottom-40"><div class="w-container"><div class="fontsize-large fontweight-semibold u-marginbottom-30 u-text-center">Recomendações de campanhas para você</div><div class="w-row"><div class="w-col w-col-4"><div class="card card-project u-radius"><div class="card-project-thumb"></div><div class="card-project-description"><div class="fontsize-base fontweight-semibold lineheight-tight u-marginbottom-10 u-text-center-small-only">Um título de projeto com um nome grande pra caramba</div><div class="fontcolor-secondary fontsize-smaller w-hidden-small w-hidden-tiny">Nova linha de óculos de serragem desenvolvida a partir do reaproveitamento dos resíduos gerados na produção dos óculos Zerezes!</div></div><div class="card-project-author u-text-center-small-only w-clearfix w-hidden-small w-hidden-tiny"><div class="small thumb u-left u-round w-hidden-small w-hidden-tiny"></div><div class="card-author-name"><a class="fontsize-smaller link-hidden" href="#">Márcio Oliveira</a></div></div><div class="card-project-meter"><div class="meter"><div class="meter-fill"></div></div></div><div class="card-project-stats"><div class="w-row"><div class="w-col w-col-4 w-col-small-4 w-col-tiny-4"><div class="fontsize-base fontweight-semibold">37%</div></div><div class="u-text-center-small-only w-col w-col-4 w-col-small-4 w-col-tiny-4"><div class="fontsize-smaller fontweight-semibold">R$455.555</div><div class="fontsize-smallest lineheight-tightest">Levantados</div></div><div class="u-text-right w-col w-col-4 w-col-small-4 w-col-tiny-4"><div class="fontsize-smaller fontweight-semibold">27 dias</div><div class="fontsize-smallest lineheight-tightest">Restantes</div></div></div></div></div></div><div class="w-col w-col-4"><div class="card card-project u-radius"><div class="card-project-thumb"></div><div class="card-project-description"><div class="fontsize-base fontweight-semibold lineheight-tight u-marginbottom-10 u-text-center-small-only">Um título de projeto com um nome grande pra caramba</div><div class="fontcolor-secondary fontsize-smaller w-hidden-small w-hidden-tiny">Nova linha de óculos de serragem desenvolvida a partir do reaproveitamento dos resíduos gerados na produção dos óculos Zerezes!</div></div><div class="card-project-author u-text-center-small-only w-clearfix w-hidden-small w-hidden-tiny"><div class="small thumb u-left u-round w-hidden-small w-hidden-tiny"></div><div class="card-author-name"><a class="fontsize-smaller link-hidden" href="#">Márcio Oliveira</a></div></div><div class="card-project-meter"><div class="meter"><div class="meter-fill"></div></div></div><div class="card-project-stats"><div class="w-row"><div class="w-col w-col-4 w-col-small-4 w-col-tiny-4"><div class="fontsize-base fontweight-semibold">37%</div></div><div class="u-text-center-small-only w-col w-col-4 w-col-small-4 w-col-tiny-4"><div class="fontsize-smaller fontweight-semibold">R$455.555</div><div class="fontsize-smallest lineheight-tightest">Levantados</div></div><div class="u-text-right w-col w-col-4 w-col-small-4 w-col-tiny-4"><div class="fontsize-smaller fontweight-semibold">27 dias</div><div class="fontsize-smallest lineheight-tightest">Restantes</div></div></div></div></div></div><div class="w-col w-col-4"><div class="card card-project u-radius"><div class="card-project-thumb"></div><div class="card-project-description"><div class="fontsize-base fontweight-semibold lineheight-tight u-marginbottom-10 u-text-center-small-only">Um título de projeto com um nome grande pra caramba</div><div class="fontcolor-secondary fontsize-smaller w-hidden-small w-hidden-tiny">Nova linha de óculos de serragem desenvolvida a partir do reaproveitamento dos resíduos gerados na produção dos óculos Zerezes!</div></div><div class="card-project-author u-text-center-small-only w-clearfix w-hidden-small w-hidden-tiny"><div class="small thumb u-left u-round w-hidden-small w-hidden-tiny"></div><div class="card-author-name"><a class="fontsize-smaller link-hidden" href="#">Márcio Oliveira</a></div></div><div class="card-project-meter"><div class="meter"><div class="meter-fill"></div></div></div><div class="card-project-stats"><div class="w-row"><div class="w-col w-col-4 w-col-small-4 w-col-tiny-4"><div class="fontsize-base fontweight-semibold">37%</div></div><div class="u-text-center-small-only w-col w-col-4 w-col-small-4 w-col-tiny-4"><div class="fontsize-smaller fontweight-semibold">R$455.555</div><div class="fontsize-smallest lineheight-tightest">Levantados</div></div><div class="u-text-right w-col w-col-4 w-col-small-4 w-col-tiny-4"><div class="fontsize-smaller fontweight-semibold">27 dias</div><div class="fontsize-smallest lineheight-tightest">Restantes</div></div></div></div></div></div></div></div></div>
  ])
}
};

export default thankYou;
