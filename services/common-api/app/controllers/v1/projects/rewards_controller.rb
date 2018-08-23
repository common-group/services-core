# frozen_string_literal: true

module V1
  module Projects
    # RewardsController
    # Project owner and platform users can manage their project rewards
    class RewardsController < ApiBaseController
      before_action :parent, except: %i[create]
      before_action :authenticate_user!

      def create
        @resource = parent.rewards.new(permitted_attributes(@resource))

        authorize @resource
        @resource.save

        return render json: @resource.errors, status: 400 unless @resource.valid?
        render json: { reward_id: @resource.id }
      end

      def update
        resource = parent.rewards.find params[:id]
        resource.update_attributes(permitted_attributes(resource))

        authorize resource, :update?
        resource.save

        return render json: resource.errors, status: 400 unless resource.valid?
        render json: { reward_id: resource.id }
      end

      def destroy
        resource = parent.rewards.find params[:id]
        authorize resource, :destroy?

        return render status: 200, json: { reward_id: resource.id, deleted: 'OK' } if resource.destroy
        render status: 400, json: resource.errors
      end

      private
      def policy(record)
        RewardPolicy.new(current_user, record)
      end

      def pundit_params_for(record)
        params.require(:reward)
      end

      def parent
        @resource ||= current_platform.projects.find params[:project_id]
      end
    end
  end
end
