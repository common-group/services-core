module Catarse
  class BaseAPI < Grape::API
    mount V2::BaseAPI
  end
end
