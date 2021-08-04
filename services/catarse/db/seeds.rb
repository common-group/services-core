# frozen_string_literal: true

raise 'only run in development' unless Rails.env.development?

Rails.logger.debug 'Seeding the database...'

[
  { pt: 'Arte', en: 'Art', fr: 'Art' },
  { pt: 'Artes plásticas', en: 'Visual Arts', fr: 'Art plastique' },
  { pt: 'Circo', en: 'Circus', fr: 'Cirque' },
  { pt: 'Comunidade', en: 'Community', fr: 'Comunauté' },
  { pt: 'Humor', en: 'Humor', fr: 'Humour' },
  { pt: 'Quadrinhos', en: 'Comicbooks', fr: 'bd' },
  { pt: 'Dança', en: 'Dance', fr: 'Dance' },
  { pt: 'Design', en: 'Design', fr: 'Design' },
  { pt: 'Eventos', en: 'Events', fr: 'Événementiel' },
  { pt: 'Moda', en: 'Fashion', fr: 'Mode' },
  { pt: 'Gastronomia', en: 'Gastronomy', fr: 'Gastronomie' },
  { pt: 'Cinema e Vídeo', en: 'Film & Video', fr: 'Cinéma' },
  { pt: 'Jogos', en: 'Games', fr: 'Jeux' },
  { pt: 'Jornalismo', en: 'Journalism', fr: 'Journalisme' },
  { pt: 'Música', en: 'Music', fr: 'Musique' },
  { pt: 'Fotografia', en: 'Photography', fr: 'Photographie' },
  { pt: 'Ciência e Tecnologia', en: 'Science & Technology', fr: 'Sciences et technologies' },
  { pt: 'Teatro', en: 'Theatre', fr: 'Théatre' },
  { pt: 'Esporte', en: 'Sport', fr: 'Sport' },
  { pt: 'Web', en: 'Web', fr: 'Web' },
  { pt: 'Carnaval', en: 'Carnival', fr: 'Carnaval' },
  { pt: 'Arquitetura e Urbanismo', en: 'Architecture & Urbanism', fr: 'Architecture et Urbanisme' },
  { pt: 'Literatura', en: 'Literature', fr: 'Literature' },
  { pt: 'Mobilidade e Transporte', en: 'Mobility & Transportation', fr: 'Transport et Mobilité' },
  { pt: 'Meio Ambiente', en: 'Environment', fr: 'Environement' },
  { pt: 'Negócios Sociais', en: 'Social Business', fr: 'Social' },
  { pt: 'Educação', en: 'Education', fr: 'Éducation' },
  { pt: 'Filmes de Ficção', en: 'Fiction Films', fr: 'Films de fiction' },
  { pt: 'Filmes Documentários', en: 'Documentary Films', fr: 'Films documentaire' },
  { pt: 'Filmes Universitários', en: 'Experimental Films' },
  { pt: 'Saúde', en: 'Health', fr: 'Santé' }
].each do |name|
  category = Category.find_or_initialize_by(name_pt: name[:pt])
  category.update(name_en: name[:en])
  category.update(name_fr: name[:fr])
end

{
  company_name: 'Catarse',
  company_logo: 'http://catarse.me/assets/catarse_bootstrap/logo_icon_catarse.png',
  host: 'catarse.me',
  base_url: 'http://catarse.me',

  email_contact: 'contato@catarse.me',
  email_payments: 'financeiro@catarse.me',
  email_projects: 'projetos@catarse.me',
  email_system: 'nao-responda@catarse.me',
  email_no_reply: 'no-reply@catarse.me',
  facebook_url: 'http://facebook.com/catarse.me',
  facebook_app_id: '173747042661491',
  twitter_url: 'http://twitter.com/catarse',
  twitter_username: 'catarse',
  mailchimp_url: 'http://catarse.us5.list-manage.com/subscribe/post?u=ebfcd0d16dbb0001a0bea3639&amp;id=149c39709e',
  catarse_fee: '0.13',
  support_forum: 'http://suporte.catarse.me/',
  base_domain: 'catarse.me',
  uservoice_secret_gadget: 'change_this',
  uservoice_key: 'uservoice_key',
  faq_url: 'http://suporte.catarse.me/',
  feedback_url: 'http://suporte.catarse.me/forums/103171-catarse-ideias-gerais',
  terms_url: 'http://suporte.catarse.me/knowledgebase/articles/161100-termos-de-uso',
  privacy_url: 'http://suporte.catarse.me/knowledgebase/articles/161103-pol%C3%ADtica-de-privacidade',
  about_channel_url: 'http://blog.catarse.me/conheca-os-canais-do-catarse/',
  instagram_url: 'http://instagram.com/catarse_',
  blog_url: 'http://blog.catarse.me',
  github_url: 'http://github.com/catarse',
  contato_url: 'http://suporte.catarse.me/'
}.each do |name, value|
  conf = CatarseSettings.find_or_initialize_by(name: name)
  next unless conf.new_record?

  conf.update(value: value)
end

OauthProvider.find_or_create_by!(name: 'facebook') do |o|
  o.key = 'your_facebook_app_key'
  o.secret = 'your_facebook_app_secret'
  o.path = 'facebook'
end

Rails.logger.debug
Rails.logger.debug '============================================='
Rails.logger.debug ' Showing all Authentication Providers'
Rails.logger.debug '---------------------------------------------'

OauthProvider.all.each do |conf|
  a = conf.attributes
  Rails.logger.debug "  name #{a['name']}"
  Rails.logger.debug "     key: #{a['key']}"
  Rails.logger.debug "     secret: #{a['secret']}"
  Rails.logger.debug "     path: #{a['path']}"
  Rails.logger.debug
end

Rails.logger.debug
Rails.logger.debug '============================================='
Rails.logger.debug ' Showing all entries in Configuration Table...'
Rails.logger.debug '---------------------------------------------'

CatarseSettings.all.each do |conf|
  a = conf.attributes
  Rails.logger.debug "  #{a['name']}: #{a['value']}"
end

Rails.cache.clear

Rails.logger.debug '---------------------------------------------'
Rails.logger.debug 'Done!'
