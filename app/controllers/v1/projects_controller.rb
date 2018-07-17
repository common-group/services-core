module V1
  class ProjectsController < ApplicationController
    def create
      render json: { message: 'creating new project' }
    end

    def update
      render json: { message: 'updating new project' }
    end

    def destroy
      render json: { message: 'delete new project' }
    end
  end
end
