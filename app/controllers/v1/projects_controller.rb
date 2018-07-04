module V1
  class ProjectsController < ApplicationController
    def index
      render json: { message: 'message' }
    end
  end
end
