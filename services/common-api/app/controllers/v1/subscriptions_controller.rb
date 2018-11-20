module V1
    class SubscriptionsController < ApiBaseController
        before_action :authenticate_user!
        before_action :resource, except: %i[set_anonymity_state]
  
        def set_anonymity_state
            anonymity_state = params[:set_anonymity_state]
            @subscription = CommonModels::Subscription.find_by_id(params[:subscription_id])

            authorize @subscription
            @subscription.checkout_data[:anonymous] = anonymity_state

            @subscription.save

            return render json: @subscription.errors, status: 400 unless @subscription.valid? 
                render json: { set_subscription_anonymity: { anonymous: anonymity_state } }
        end

    end
    
end