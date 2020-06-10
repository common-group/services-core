import m from 'mithril'
import h from '../../../h'
import { ProjectDetails } from '../../../@types/project-details'
import { DescriptionEditTips } from '../../../c/projects/publish-by-steps/description-edit-tips'


export type DescriptionEditAttrs = {
    project: ProjectDetails
    isSaving: boolean
    save(imageFile: File): void
    getFieldErrors(field: string): string[]
}

export class DescriptionEdit implements m.Component {

    view({ attrs }: m.Vnode<DescriptionEditAttrs>) {

        const project = attrs.project
        const isSaving = attrs.isSaving
        const save = attrs.save
        const getFieldErrors = attrs.getFieldErrors

        return (
            <div class="section">
                <div class="w-container">
                    <div class="w-row">
                        <div class="w-col w-col-8">
                            <div class="card medium card-terciary u-radius w-form">
                                <form>
                                    <div class="title-dashboard">
                                        Fale sobre o seu projeto
                                </div>
                                    <div class="u-marginbottom-30">
                                        <label for="name-26" class="field-label fontweight-semibold u-marginbottom-10">
                                            Quanto você quer arrecadar?
                                    </label>
                                        <div class="u-marginbottom-20 w-row">
                                            <div class="w-col w-col-3 w-col-small-3 w-col-tiny-3">
                                                <div class="back-reward-input-reward placeholder">R$</div>
                                            </div>
                                            <div class="w-col w-col-9 w-col-small-9 w-col-tiny-9">
                                                <input type="text" maxlength="256" placeholder="35" class="back-reward-input-reward w-input" />
                                            </div>
                                        </div>
                                    </div>
                                    <div class="u-marginbottom-30">
                                        <label for="name" class="field-label fontweight-semibold u-marginbottom-10">
                                            Descrição do projeto
                                        </label>
                                        {h.redactor('project[about_html]', (about_html?: string) => {
                                            if (typeof about_html !== 'undefined') {
                                                project.about_html = about_html
                                            }

                                            return project.about_html || ''
                                        })}
                                    </div>
                                    <div class="u-marginbottom-30 w-row">
                                        <div class="_w-sub-col w-col w-col-5">
                                            <label for="name-7" class="field-label fontweight-semibold">Link do projeto</label></div>
                                        <div class="w-col w-col-7">
                                            <div class="w-row">
                                                <div class="text-field prefix no-hover w-col w-col-4 w-col-small-6 w-col-tiny-6">
                                                    <div class="fontcolor-secondary u-text-center fontsize-smallest">catarse.me/
                                        </div>
                                                </div>
                                                <div class="w-col w-col-8 w-col-small-6 w-col-tiny-6">
                                                    <input type="text" id="name-6" maxlength="256" name="name-6" data-name="Name 6" placeholder="tragediacarioca" class="text-field postfix positive w-input" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="u-marginbottom-30">
                                        <div class="w-row">
                                            <div class="w-col w-col-5">
                                                <label for="name-9" class="field-label fontweight-semibold">
                                                    Local do projeto
                                                <br />
                                                </label>
                                            </div>
                                            <div class="w-col w-col-7">
                                                <input type="text" class="text-field positive w-input" maxlength="256" name="field-12" data-name="Field 12" id="field-12" required="" />
                                            </div>
                                        </div>
                                    </div>
                                    <div class="u-margintop-40 u-marginbottom-20 w-row">
                                        <div class="w-col w-col-2"></div>
                                        <div class="w-col w-col-8">
                                            <a href="/dashboard/solidaria/ask-about-reward" class="btn btn-large">
                                                Próximo &gt;
                                            </a>
                                        </div>
                                        <div class="w-col w-col-2"></div>
                                    </div>
                                    <div class="w-row">
                                        <div class="w-col w-col-2"></div>
                                        <div class="w-col w-col-4">
                                            <a href="#" class="btn btn-medium btn-terciary" data-ix="show-modal" style="transition: all 0.5s ease 0s;">
                                                Ver página
                                            </a>
                                        </div>
                                        <div class="w-col w-col-4">
                                            <a href="#" class="btn btn-medium btn-terciary" data-ix="show-modal" style="transition: all 0.5s ease 0s;">
                                                Salvar
                                            </a>
                                        </div>
                                        <div class="w-col w-col-2"></div>
                                    </div>
                                </form>
                            </div>
                            <div class="u-text-center u-margintop-20 fontsize-smaller">
                                <a href="/dashboard/solidaria/card" class="link-hidden-dark">
                                    &lt; Voltar
                    </a>
                            </div>
                        </div>

                        <div class="w-col w-col-4">
                            <DescriptionEditTips />
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}