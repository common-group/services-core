# frozen_string_literal: true

module V1
  module Projects
    # GoalsController
    # Project owner and platform users can manage they project goals
    class GoalsController < ApiBaseController
      before_action :parent, except: %i[create]
      before_action :authenticate_user!

      def create
        resource = parent.goals.new(permitted_attributes(resource))
        resource.tap { |g| g.platform = current_platform }

        authorize resource, :create?
        resource.save

        return render json: resource.errors, status: 400 unless resource.valid?
        render json: { goal_id: resource.id }
      end

      def update
        resource = parent.goals.find params[:id]
        resource.update_attributes(permitted_attributes(resource))

        authorize resource, :update?
        resource.save

        return render json: resource.errors, status: 400 unless resource.valid?
        render json: { goal_id: resource.id }
      end

      def destroy
        render json: { message: 'delete new goal' }
      end

      private

      def policy(record)
        GoalPolicy.new((current_user.presence||current_platform_user.presence), record)
      end

      def pundit_params_for(record)
        params.require(:goal)
      end

      def parent
        @resource ||= current_platform.projects.find params[:project_id]
      end
    end
  end
end
