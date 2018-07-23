# frozen_string_literal: true

module V1
  module Projects
    # Create reports for projects that break the rules
    class ReportsController < ApiBaseController
      before_action :parent, except: %i[create]
      before_action :authenticate_user!

      def create
        resource = parent.reports.new(permitted_attributes(resource))

        authorize resource
        resource.save

        return render json: resource.errors, status: 400 unless resource.valid?
        render json: { report_id: resource.id }
      end

      private

      def policy(record)
        ReportPolicy.new((current_user.presence || current_platform_user.presence), record)
      end

      def pundit_params_for(record)
        params.require(:report)
      end

      def parent
        @resource ||= current_platform.projects.find params[:project_id]
      end
    end
  end
end
