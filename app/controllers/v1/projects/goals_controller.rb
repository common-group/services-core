# frozen_string_literal: true

module V1
  module Projects
    # GoalsController
    # Project owner and platform users can manage they project goals
    class GoalsController < ApiBaseController
      before_action :parent
      before_action :authenticate_user!

      def create
        resource = collection
                   .new(permitted_attributes(resource))
                   .tap { |r| r.project = parent }

        authorize resource, :create?
        resource.save

        return render json: resource.errors, status: 400 unless resource.valid?
        render json: { goal_id: resource.id }
      end

      def update
        resource = collection.find params[:id]
        authorize resource, :update?
        resource.update_attributes(permitted_attributes(resource))

        resource.save

        return render json: resource.errors, status: 400 unless resource.valid?
        render json: { goal_id: resource.id }
      end

      def destroy
        resource = collection.find params[:id]
        authorize resource, :destroy?

        return render status: 200, json: { goal_id: resource.id, deleted: 'OK' } if resource.destroy
        render status: 400, json: resource.errors
      end

      private

      def policy(record)
        GoalPolicy.new(current_user, record)
      end

      def pundit_params_for(record)
        params.require(:goal)
      end

      def parent
        @parent ||= current_platform.projects.find params[:project_id]
      end

      def collection
        @collection ||= policy_scope(
          CommonModels::Goal,
          policy_scope_class: GoalPolicy::Scope
        )
      end
    end
  end
end
