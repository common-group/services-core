module V1
  class DirectMessagesController < ApiBaseController
      before_action :authenticate_user!
      before_action :resource, except: %i[create]

      def create
        @direct_message = CommonModels::DirectMessage.new(permitted_attributes(@direct_message))
        @direct_message.tap { |p| p.platform = current_platform }

        authorize @direct_message
        @direct_message.save

        return render json: @direct_message.errors, status: 400 unless @direct_message.valid?
        render json: { direct_message_id: @direct_message.id }
      end

      private

      def resource
        @direct_message ||= current_platform.direct_messages.find params[:id]
      end

      def policy(record)
        DirectMessagePolicy.new((current_user.presence||current_platform_user.presence), record)
      end

      def pundit_params_for(record)
        params.require(:direct_message)
      end
  end
end
