# frozen_string_literal: true

module V1
  module Projects
    # ContributionsController
    # Project owner and platform users can manage their project contributions
    class ContributionsController < ApiBaseController
      before_action :parent
      before_action :authenticate_user!

      def create
        @resource = parent.contributions.new(permitted_attributes(@resource))
        @resource.tap { |r| r.platform = current_platform }

        authorize @resource
        @resource.save

        return render json: @resource.errors, status: 400 unless @resource.valid?
        render json: { contribution_id: @resource.id }
      end

      def update
        resource = parent.contributions.find params[:id]
        resource.update_attributes(permitted_attributes(resource))

        authorize resource, :update?
        resource.save

        return render json: resource.errors, status: 400 unless resource.valid?
        render json: { contribution_id: resource.id }
      end

      private
      def policy(record)
        ContributionPolicy.new(current_user, record)
      end

      def pundit_params_for(record)
        params.require(:contribution)
      end

      def parent
        @resource ||= current_platform.projects.find params[:project_id]
      end
    end
  end
end
