module V1
  class Projects::GoalsController < ApplicationController
    before_action :resource, except: %i[create]

    def create
      binding.pry
      render json: { message: 'creating new goal' }
    end

    def update
      render json: { message: 'updating new goal' }
    end

    def destroy
      render json: { message: 'delete new goal' }
    end

    protected

    def resource
      @resource ||= CommonModels::Project.find params[:project_id]
    end
  end
end
