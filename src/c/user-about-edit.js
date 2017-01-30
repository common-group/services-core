import m from 'mithril';
import _ from 'underscore';
import h from '../h';
import userVM from '../vms/user-vm';
import popNotification from './pop-notification';

const userAboutEdit = {
    controller(args) {
        const user = args.user,
              fields = {
                  uploaded_image: m.prop(userVM.displayImage(user)),
                  cover_image: m.prop(user.profile_cover_image),
                  permalink: m.prop(user.permalink),
                  name: m.prop(user.name),
                  facebook_link: m.prop(user.facebook_link),
                  twitter: m.prop(user.twitter_username),
                  links: m.prop(user.links||[]),
                  about_html: m.prop(user.about_html)
              },
              showSuccess = m.prop(false),
              showError = m.prop(false),
              errors = m.prop(),
              loading = m.prop(false),
              uploading = m.prop(false),
              errorsArray = m.prop([]),
              pushErrosMessage = () => {
                  errors(errorsArray().join('<br/>'));
              },
              updateFieldsFromUser = () => {
                  userVM.fetchUser(args.userId, false).then((dataResponse) => {
                      let data = _.first(dataResponse);
                      fields.uploaded_image(userVM.displayImage(data));
                      fields.cover_image(data.profile_cover_image);
                      fields.permalink(data.permalink);
                      fields.name(data.name);
                      fields.facebook_link(data.facebook_link);
                      fields.twitter(data.twitter_username);
                      fields.links(data.links);
                      fields.about_html(data.about_html);
                  });
              },
              uploadImage = () => {
                  const userUploadedImageEl = window.document.getElementById('user_uploaded_image'),
                        userCoverImageEl = window.document.getElementById('user_cover_image'),
                        formData = new FormData();

                  formData.append('uploaded_image', userUploadedImageEl.files[0]);
                  formData.append('cover_image', userCoverImageEl.files[0]);

                  uploading(true);
                  m.redraw();

                  return m.request({
                      method: 'POST',
                      url: `/users/${user.id}/upload_image.json`,
                      data: formData,
                      config: h.setCsrfToken,
                      serialize: function(data) {return data}
                  }).then((data) => {
                      fields.uploaded_image(data.uploaded_image);
                      fields.cover_image(data.cover_image);
                      uploading(false);
                  }).catch((err) => {
                      if (_.isArray(err.errors)) {
                          errorsArray(errorsArray().concat(err.errors));
                      } else {
                          error('Erro ao atualizar informações.');
                      }
                      pushErrosMessage();
                      showError(true);
                      uploading(false);
                  });
              },

              updateUser = (e) => {
                  e.preventDefault();
                  const userData = {
                      permalink: fields.permalink(),
                      name: fields.name(),
                      facebook_link: fields.facebook_link(),
                      twitter: fields.twitter(),
                      about_html: fields.about_html(),
                      links_attributes: linkAttributes()
                  };

                  loading(true);
                  uploadImage();

                  return m.request({
                      method: 'PUT',
                      url: `/users/${user.id}.json`,
                      data: {
                          user: userData
                      },
                      config: h.setCsrfToken
                  }).then(() => {
                      showSuccess(true);
                      updateFieldsFromUser();
                      loading(false);
                      m.redraw();
                  }).catch((err) => {
                      if (_.isArray(err.errors)) {
                          errorArray(errorsArray().concat(err.errors));
                      } else {
                          error('Erro ao atualizar informações.');
                      }

                      pushErrosMessage();
                      showError(true);
                      loading(false);
                      m.redraw();
                  });
              },
              removeLinks = [],
              addLink = () => fields.links().push({link: ''}),
              removeLink = (linkId, idx) => () => {
                  fields.links()[idx]._destroy = true;
                  return false;
              },
              linkAttributes = () =>{
                  return _.reduce(fields.links(), (memo, item, index) => {
                      memo[index.toString()] = item;
                      return memo;
                  }, {});
              };
        // Temporary fix for the menu selection bug. Should be fixed/removed as soon as we route all tabs from mithril.
        setTimeout(m.redraw, 0);

        return {
            removeLinks,
            removeLink,
            addLink,
            fields,
            updateUser,
            loading,
            showSuccess,
            showError,
            errors,
            uploading
        };
    },
    view(ctrl, args) {
        const user = args.user || {},
              fields = ctrl.fields;

        return m('#about-tab.content', [
            (ctrl.showSuccess() && !ctrl.loading() && !ctrl.uploading() ? m.component(popNotification, {
                message: 'As suas informações foram atualizadas'
            }) : ''),
            (ctrl.showError() && !ctrl.loading() && !ctrl.uploading() ? m.component(popNotification, {
                message: m.trust(ctrl.errors()),
                error: true
            }) : ''),
            m('form.simple_form.w-form', { onsubmit: ctrl.updateUser } , [
                m('input[name="utf8"][type="hidden"][value="✓"]'),
                m('input[name="_method"][type="hidden"][value="patch"]'),
                m(`input[name="authenticity_token"][type="hidden"][value=${h.authenticityToken()}]`),
                m('div',
                    m('.w-container',
                        m('.w-row',
                            m('.w-col.w-col-10.w-col-push-1',
                                [
                                    m('.w-form',
                                        [
                                            m('.w-row.u-marginbottom-30.card.card-terciary',
                                                [
                                                    m('.w-col.w-col-5.w-sub-col',
                                                        [
                                                            m('label.field-label.fontweight-semibold',
                                                                '  Imagem do perfil'
                                                            ),
                                                            m('label.field-label.fontsize-smallest.fontcolor-secondary',
                                                                '  Essa imagem será utilizada como a miniatura de seu perfil (PNG, JPG tamanho 280 x 280)'
                                                            )
                                                        ]
                                                    ),
                                                    m('.w-col.w-col-4.w-sub-col',
                                                        m('.input.file.optional.user_uploaded_image.field_with_hint',
                                                            [
                                                                m('label.field-label'),
                                                                m('span.hint',
                                                                    m(`img[alt="Avatar do Usuario"][src="${fields.uploaded_image()}"]`)
                                                                ),
                                                                m('input.file.optional.w-input.text-field[id="user_uploaded_image"][type="file"]', {
                                                                    name: 'user[uploaded_image]'
                                                                })
                                                            ]
                                                        )
                                                    )
                                                ]
                                            ),
                                            m('.w-row.u-marginbottom-30.card.card-terciary',
                                                [
                                                    m('.w-col.w-col-5.w-sub-col',
                                                        [
                                                            m('label.field-label.fontweight-semibold',
                                                                '  Imagem de capa do perfil'
                                                            ),
                                                            m('label.field-label.fontsize-smallest.fontcolor-secondary',
                                                                '  Essa imagem será utilizada como fundo do cabeçalho do seu perfil público (PNG ou JPG). Caso você não envie nenhum imagem aqui, utilizaremos sua imagem de perfil como alternativa.'
                                                            )
                                                        ]
                                                    ),
                                                    m('.w-col.w-col-4.w-sub-col',
                                                        m('.input.file.optional.user_cover_image',
                                                            [
                                                                m('label.field-label'),
                                                                m('span.hint',
                                                                  user.profile_cover_image ? m('img', {src: fields.cover_image()}) : ''
                                                                ),
                                                                m('input.file.optional.w-input.text-field[id="user_cover_image"][type="file"]', {name: 'user[cover_image]'})
                                                            ]
                                                        )
                                                    )
                                                ]
                                            )
                                        ]
                                    ),
                                    !user.is_admin ? '' : m('.w-row.u-marginbottom-30.card.card-terciary',
                                        [
                                            m('.w-col.w-col-5.w-sub-col',
                                                [
                                                    m('label.field-label.fontweight-semibold',
                                                        'Endereço do seu perfil'
                                                    ),
                                                    m('label.field-label.fontsize-smallest.fontcolor-secondary',
                                                        'Seu perfil público pode ter uma URL personalizada. Escolha uma fácil de guardar!    '
                                                    )
                                                ]
                                            ),
                                            m('.w-col.w-col-7',
                                                m('.w-row',
                                                    [
                                                        m('.w-col.w-col-6.w-col-small-6.w-col-tiny-6',
                                                            m('input.string.optional.w-input.text-field.text-field.positive.prefix[id="user_permalink"][type="text"]',{
                                                                name: 'user[permalink]',
                                                                value: fields.permalink(),
                                                                onchange: m.withAttr('value', fields.permalink)
                                                            })
                                                        ),
                                                        m('.w-col.w-col-6.w-col-small-6.w-col-tiny-6.text-field.postfix.no-hover',
                                                            m('.fontcolor-secondary.fontsize-smaller', '  .catarse.me')
                                                        )
                                                    ]
                                                )
                                            )
                                        ]
                                    ),
                                    m('.w-row.u-marginbottom-30.card.card-terciary',
                                        [
                                            m('.w-col.w-col-5.w-sub-col',
                                                [
                                                    m('label.field-label.fontweight-semibold',
                                                        '  Nome'
                                                    ),
                                                    m('label.field-label.fontsize-smallest.fontcolor-secondary',
                                                        '  Esse é o nome que os usuários irão ver no seu perfil público'
                                                    )
                                                ]
                                            ),
                                            m('.w-col.w-col-7',
                                                m('input.string.optional.w-input.text-field.positive[id="user_name"][type="text"]', {
                                                    name: 'user[name]',
                                                    value: fields.name(),
                                                    onchange: m.withAttr('value', fields.name)
                                                })
                                            )
                                        ]
                                    ),
                                    m('.w-form.card.card-terciary.u-marginbottom-30',
                                        [
                                            m('.w-row.u-marginbottom-10',
                                                [
                                                    m('.w-col.w-col-5.w-sub-col',
                                                        [
                                                            m('label.field-label.fontweight-semibold',
                                                                '  Perfil do facebook'
                                                            ),
                                                            m('label.field-label.fontsize-smallest.fontcolor-secondary',
                                                                '  Cole o link do seu perfil'
                                                            )
                                                        ]
                                                    ),
                                                    m('.w-col.w-col-7',
                                                        m('input.string.optional.w-input.text-field.positive[type="text"]', {
                                                            name: 'user[facebook_link]',
                                                            value: fields.facebook_link(),
                                                            onchange: m.withAttr('value', fields.facebook_link)
                                                        })
                                                    )
                                                ]
                                            ),
                                            m('.w-row.u-marginbottom-10',
                                                [
                                                    m('.w-col.w-col-5.w-sub-col',
                                                        [
                                                            m('label.field-label.fontweight-semibold',
                                                                '  Perfil do twitter'
                                                            ),
                                                            m('label.field-label.fontsize-smallest.fontcolor-secondary',
                                                                '  Cole o link do seu perfil'
                                                            )
                                                        ]
                                                    ),
                                                    m('.w-col.w-col-7',
                                                        m('input.string.optional.w-input.text-field.positive[type="text"]', {
                                                            name: 'user[twitter]',
                                                            value: fields.twitter(),
                                                            onchange: m.withAttr('value', fields.twitter)
                                                        })
                                                    )
                                                ]
                                            )
                                        ]
                                    ),
                                    m('.w-form.card.card-terciary.u-marginbottom-30',
                                        m('.w-row.u-marginbottom-10',
                                            [
                                                m('.w-col.w-col-5.w-sub-col',
                                                    [
                                                        m('label.field-label.fontweight-semibold[for="name-8"]',
                                                            ' Presença na internet'
                                                        ),
                                                        m('label.field-label.fontsize-smallest.fontcolor-secondary[for="name-8"]', ' Inclua links que ajudem outros usuários a te conhecer melhor. ')
                                                    ]
                                                ),
                                                m('.w-col.w-col-7',
                                                    [
                                                        m('.w-row',
                                                          [fields.links() && fields.links().length <= 0 ? '' : m('.link', _.map(fields.links(),
                                                                (link, idx) => {
                                                                    const toRemove = link._destroy;

                                                                    return m('div', {
                                                                            key: idx,
                                                                            class: toRemove ? 'w-hidden' : 'none'
                                                                        } , [
                                                                            m('.w-col.w-col-10.w-col-small-10.w-col-tiny-10',
                                                                                m(`input.string.w-input.text-field.w-input.text-field][type="text"][value="${link.link}"]`, {
                                                                                    class: link.link === '' ? 'positive' : 'optional',
                                                                                    name: `user[links_attributes][${idx}][link]`,
                                                                                    onchange: m.withAttr('value', (val) => fields.links()[idx].link = val)
                                                                                })
                                                                            ),
                                                                            m('.w-col.w-col-2.w-col-small-2.w-col-tiny-2',
                                                                                [
                                                                                    m('a.btn.btn-small.btn-terciary.fa.fa-lg.fa-trash.btn-no-border', {
                                                                                        onclick: ctrl.removeLink(link.id, idx)
                                                                                    })
                                                                                ]
                                                                            )
                                                                        ]
                                                                    );
                                                                }
                                                            ))
                                                            ]
                                                        ),
                                                        m('.w-row',
                                                            [
                                                                m('.w-col.w-col-6.w-col-push-6',
                                                                    m('a.btn.btn-small.btn-terciary',
                                                                        { onclick: ctrl.addLink },
                                                                        m('span.translation_missing', 'Add Link')
                                                                    )
                                                                )
                                                            ]
                                                        )
                                                    ]
                                                )
                                            ]
                                        )
                                    ),
                                    m('.w-row',
                                        m('.w-col',
                                            m('.card.card-terciary.u-marginbottom-30',
                                                [
                                                    m('label.field-label.fontweight-semibold',
                                                        'Sobre'
                                                    ),
                                                    m('label.field-label.fontsize-smallest.fontcolor-secondary.u-marginbottom-20',
                                                        'Fale sobre você e tente fornecer as informações mais relevantes para que visitantes possam te conhecer melhor. '
                                                    ),
                                                    m('.w-form',
                                                        m('.preview-container.u-marginbottom-40', h.redactor('user[about_html]', fields.about_html))
                                                    )
                                                ]
                                            )
                                        )
                                    )
                                ]
                            )
                        )
                    )
                ),
                m('div',
                    m('.w-container',
                        m('.w-row', [
                            m('.w-col.w-col-4.w-col-push-4',
                                [
                                    m('input[id="anchor"][name="anchor"][type="hidden"][value="about_me"]'),
                                    (!ctrl.loading() && !ctrl.uploading() ? m('input.btn.btn.btn-large[name="commit"][type="submit"][value="Salvar"]', {
                                        onclick: ctrl.updateUser
                                    }) : h.loader())
                                ]
                            ),
                            m('.w-col.w-col-4')
                        ])
                    )
                )
            ])
            ]
        );
    }
};

export default userAboutEdit;
