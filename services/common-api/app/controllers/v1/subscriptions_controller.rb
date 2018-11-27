module V1
    class SubscriptionsController < ApiBaseController
        before_action :cors_preflight_check, :authenticate_user!
        before_action :resource

        after_action :cors_set_access_control_headers
  
        def set_anonymity_state
            puts "================================"
            puts params.inspect
            puts "================================"
            anonymity_state = params[:set_anonymity_state]
            @subscription = current_platform.subscriptions.find params[:id]

            puts "HERE"
            authorize @subscription
            @subscription.checkout_data[:anonymous] = anonymity_state

            @subscription.save


            return render json: @subscription.errors, status: 400 unless @subscription.valid? 
                render json: { set_subscription_anonymity: { anonymous: anonymity_state } }
        end

        protected
        def cors_preflight_check
          puts "cors_preflight_check in MVP controller"
          if request.options?
            access_control_headers
          else
            puts "not an options method"
          end
          
          render :status => 200
        end
      
        def cors_set_access_control_headers
          access_control_headers
        end
      
        def access_control_headers
            headers['Access-Control-Allow-Credentials'] = true
            headers['Access-Control-Allow-Origin'] = '*'
            headers['Access-Control-Allow-Methods'] = 'GET, POST, PATCH, DELETE, OPTIONS, HEAD'
            headers['Access-Control-Allow-Headers'] = 'Authentication, authorization, prefer, range, range-unit, Accept, Accept-Language, Content-Language'
            headers['Access-Control-Max-Age'] = '86400'
        end
    end
    
end