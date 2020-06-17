import m from 'mithril'
import { ProjectDetails } from '../../../@types/project-details'

export type AskAboutRewardAttrs = {
    project: ProjectDetails
}

export class AskAboutReward implements m.Component {
    view({ attrs } : m.Vnode<AskAboutRewardAttrs>) {

        const project = attrs.project
        const userName = attrs.project.user?.public_name
        const askTo = userName || project.name

        return (
            <div class="section">
                <div class="w-container">
                    <div class="w-row">
                        <div class="w-col w-col-2"></div>
                        <div class="w-col w-col-8">
                            <div class="card medium card-terciary u-marginbottom-20">
                                <div class="title-dashboard">
                                    Você quer oferecer recompensas?
                                    <br/>
                                </div>
                                <div class="w-embed">
                                    <style>
                                        {
                                            `
                                            .list-dashboard .list-dashboard-item::before {
                                                color: #ddd;
                                                content: "•";
                                                font-size: 2rem;
                                                left: -.25rem;
                                                position: absolute;
                                                top: -.1875rem;
                                                z-index: 1;
                                            }
    
                                            .list-dashboard .list-dashboard-item:not(:last-child):after {
                                                background: #ddd;
                                                content: '';
                                                height: 100%;
                                                left: 0;
                                                position: absolute;
                                                top: 1.1875rem;
                                                width: 1px;
                                            }
                                            `
                                        }
                                        
                                    </style>
                                </div>
                                <div class="w-row">
                                    <div class="w-col w-col-2"></div>
                                    <div class="w-col w-col-8">
                                        <div class="fontsize-base">
                                            {askTo}
                                        </div>
                                    </div>
                                    <div class="w-col w-col-2"></div>
                                </div>
                                <div class="u-margintop-40 u-marginbottom-20 w-row">
                                    <div class="w-col w-col-1"></div>
                                    <div class="w-col w-col-5">
                                        <a href="#rewards" class="btn btn-large btn-terciary">
                                            Adicionar recompensas
                                        </a>
                                    </div>
                                    <div class="w-col w-col-5">
                                        <a href="#user" class="btn btn-large">
                                            Seguir sem recompensas
                                        </a>
                                    </div>
                                    <div class="w-col w-col-1"></div>
                                </div>
                            </div>
                        </div>
                        <div class="w-col w-col-2"></div>
                    </div>
                </div>
            </div>
        )
    }
}