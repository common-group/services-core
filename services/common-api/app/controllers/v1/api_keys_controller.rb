# frozen_string_literal: true

module V1
  # ApiKeysController
  # Scoped users can generate/disable api keys
  # Platform users can generate/disable user api keys
  class ApiKeysController < ApiBaseController
    before_action :authenticate_user!

    def destroy
      @resource = collection.find params[:id]
      authorize @resource, :destroy?
      @resource.update_attribute(:disabled_at, Time.now)
      render json: { message: 'api key disabled' }
    end

    def create
      @resource = collection.new(
        user_id: set_user_id,
        token: CommonModels::UserApiKey.gen_random_key
      )
      authorize @resource, :create?
      if @resource.save
        render json: { id: @resource.id, api_key: @resource.token }
      else
        render json: { message: @resource.errors.to_json }, status: 400
      end
    end

    private

    def policy(record)
      UserApiKeyPolicy.new(current_user, record)
    end

    def set_user_id
      is_platform_user? ? params[:user_id] : current_user.id
    end

    def collection
      @collection ||= policy_scope(
        CommonModels::UserApiKey.enabled,
        policy_scope_class: UserApiKeyPolicy::Scope
      )
    end

  end
end
