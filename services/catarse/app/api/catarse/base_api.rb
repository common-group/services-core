# frozen_string_literal: true

module Catarse
  class BaseAPI < Grape::API
    cascade false

    mount Catarse::V2::BaseAPI
  end
end
