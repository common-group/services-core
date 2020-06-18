import m from 'mithril'
import { UserDetails } from '../../../@types/user-details'
import { InputImageFile } from '../../std/input-image-file'
import { Event } from '../../../@types/event-target'

export type UserInfoEditPublicProfileAttrs = {
    user: UserDetails
    onSelectProfileImage(profileImageFile : File): void
}

export type UserInfoEditPublicProfileState = {
    selectedProfileImageFile: File | null
    imageBlobUrl: string
}

export class UserInfoEditPublicProfile implements m.Component {
    view({ attrs, state } : m.Vnode<UserInfoEditPublicProfileAttrs, UserInfoEditPublicProfileState>) {
        const user = attrs.user
        const onSelectProfileImage = attrs.onSelectProfileImage
        const profileImageUrl = state.imageBlobUrl || user.profile_img_thumbnail

        return (
            <div class="card medium card-terciary u-marginbottom-20">
                <div class="title-dashboard">
                    Agora fale sobre você
                </div>
                <div class="w-form">
                    <form id="email-form-6" name="email-form-6" data-name="Email Form 6">
                        <div class="u-marginbottom-30 w-row">
                            <div class="_w-sub-col w-col w-col-5">
                                <label for="name-11" class="fontweight-semibold fontsize-base">
                                    Nome público
                                </label>
                                <label for="name-11" class="field-label fontsize-smallest fontcolor-secondary">
                                    Esse é o nome que os usuários irão ver no seu perfil
                                </label>
                            </div>
                            <div class="w-col w-col-7">
                                <input oninput={(event : Event) => user.public_name = event.target.value} value={user.public_name} type="text" id="name-10" name="name-10" data-name="Name 10" maxlength="256" class="text-field positive w-input" />
                            </div>
                        </div>
                        <div class="u-marginbottom-20 w-row">
                            <div class="_w-sub-col w-col w-col-5">
                                <label for="name-11" class="fontweight-semibold fontsize-base">
                                    Imagem do perfil&nbsp;
                                    <span class="fontcolor-terciary">
                                        (opcional)
                                    </span>
                                </label>
                                <label for="name-11" class="field-label fontsize-smallest fontcolor-secondary">
                                    Essa imagem será utilizada como a miniatura de seu perfil (PNG, JPG)
                                </label>
                            </div>
                            <div class="_w-sub-col w-col w-col-4">
                                <InputImageFile 
                                    oninput={(event : Event<HTMLInputElement> ) => {
                                        if (event.target.files && event.target.files.length > 0) {
                                            state.selectedProfileImageFile = event.target.files[0]
                                            onSelectProfileImage(state.selectedProfileImageFile)

                                            if (profileImageUrl && profileImageUrl.indexOf('blob') >= 0) {
                                                URL.revokeObjectURL(profileImageUrl)
                                            }

                                            state.imageBlobUrl = URL.createObjectURL(state.selectedProfileImageFile)
                                        }
                                    }}
                                    class='btn btn-small btn-dark' >
                                    Escolher arquivo
                                </InputImageFile>
                                {
                                    profileImageUrl && profileImageUrl.length &&
                                    <div class="input file optional user_uploaded_image field_with_hint">
                                        <img alt="Avatar do Usuario" src={profileImageUrl} />
                                    </div>
                                }
                            </div>
                            <div class="w-col w-col-3">
                                <div class="fontsize-smallest fontcolor-secondary" style='padding-left: 4px;'>
                                    {
                                        state.selectedProfileImageFile ?
                                            state.selectedProfileImageFile.name
                                            :
                                            'Nenhum arquivo escolhido'
                                    }
                                </div>
                            </div>
                        </div>
                        <div class="u-marginbottom-10 w-row">
                            <div class="_w-sub-col w-col w-col-5">
                                <label for="name-11" class="fontweight-semibold field-label">
                                    Presença na internet&nbsp;
                                    <span class="fontcolor-terciary">
                                        (opcional)
                                    </span>
                                </label>
                                <label for="name-11" class="field-label fontsize-smallest fontcolor-secondary">
                                    Inclua links que ajudem apoiadores a te conhecer melhor.
                                    <br />
                                </label>
                            </div>
                            <div class="w-col w-col-7">
                                <div class="w-row">
                                    <div class="_w-sub-col-middle w-col w-col-10 w-col-small-10 w-col-tiny-10">
                                        <input type="text" class="text-field positive w-input" maxlength="256" name="field-36" data-name="Field 36" placeholder="Example Text" id="field-36" required="" />
                                    </div>
                                    <div class="w-col w-col-2 w-col-small-2 w-col-tiny-2">
                                        <a href="#" class="btn btn-small btn-terciary fa fa-lg fa-trash btn-no-border" aria-hidden="true"></a>
                                    </div>
                                </div>
                                <div class="w-row">
                                    <div class="w-col w-col-6"></div>
                                    <div class="w-col w-col-6">
                                        <a href="#" class="btn btn-small btn-terciary">
                                            + &nbsp; Adicionar link
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

        )
    }
}