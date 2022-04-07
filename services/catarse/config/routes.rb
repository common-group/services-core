# frozen_string_literal: true

Rails.application.routes.draw do
  draw :sidekiq
  draw :legacy
end
