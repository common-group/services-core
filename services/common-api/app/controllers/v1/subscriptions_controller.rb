# frozen_string_literal: true

module V1
  class SubscriptionsController < ApiBaseController
    before_action :authenticate_user!

    def set_anonymity_state
      anonymity_state = params[:set_anonymity_state]
      @subscription = current_platform.subscriptions.find params[:id]
      authorize @subscription, :update?
      @subscription.checkout_data[:anonymous] = anonymity_state
      if @subscription.valid? && @subscription.save
        render json: { set_subscription_anonymity: { anonymous: anonymity_state } }
      else
        render json: @subscription.errors, status: 400
      end
    end

      def policy(record)
        SubscriptionPolicy.new(
          (current_user.presence||current_platform_user.presence),
          record
        )
      end
  end
end