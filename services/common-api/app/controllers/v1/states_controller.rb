module V1
  class StatesController < ApiBaseController
      before_action :authenticate_user!
      before_action :resource, except: %i[create]

      def create
        @state = CommonModels::State.new(permitted_attributes(@state))
        @state.tap { |p| p.platform = current_platform }

        authorize @state
        @state.save

        return render json: @state.errors, status: 400 unless @state.valid?
        render json: { state_id: @state.id }
      end

      private

      def resource
        @state ||= current_platform.states.find params[:id]
      end

      def policy(record)
        StatePolicy.new((current_user.presence||current_platform_user.presence), record)
      end

      def pundit_params_for(record)
        params.require(:state)
      end
  end
end
