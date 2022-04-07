# frozen_string_literal: true

require 'sidekiq/web'
require 'sidekiq-status/web'

authenticate :user, ->(u) { u.admin? } do
  mount Sidekiq::Web => '/sidekiq'
end
