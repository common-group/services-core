module V1
  class ProjectsController < ApiBaseController
      before_action :authenticate_user!
      before_action :resource, except: %i[create]

      def create
        @project = CommonModels::Project.new(permitted_attributes(@project))
        @project.tap { |p| p.platform = current_platform }

        authorize @project
        @project.save

        return render json: @project.errors, status: 400 unless @project.valid?
        render json: { project_id: @project.id }
      end

      def update
        authorize resource
        resource.update_attributes(permitted_attributes(resource))
        resource.save

        return render json: resource.errors, status: 400 unless resource.valid?
        render json: { project_id: resource.id }
      end

      def destroy
        authorize resource

        # return render status: 200, json: { project_id: resource.id, deleted: 'OK' } if resource.destroy
        # render status: 400, json: resource.errors
        # @TODO
        render status: 200, json: { deleted: 'OK' }
      end

      def subscriptions_monthly_report_for_project_owners
        authorize resource, :update?
        report = CommonModels::SubscriptionMonthlyReportForProjectOwner.project_id(resource.id).to_csv
        respond_to do |format|
          format.csv { send_data  report}
          format.xls do
            send_data Excelinator.csv_to_xls(report)
          end
        end
      end

      #def subscriptions_report_for_project_owners
      #  authorize resource, :update?
      #  report = SubscriptionReportForProjectOwner.project_id(resource.common_id).to_csv
      #  respond_to do |format|
      #    format.csv { send_data  report}
      #    format.xls do
      #      send_data Excelinator.csv_to_xls(report)
      #    end
      #  end
      #end


      private

      def resource
        @project ||= current_platform.projects.find params[:id]
      end

      def policy(record)
        ProjectPolicy.new((current_user.presence||current_platform_user.presence), record)
      end

      def pundit_params_for(record)
        params.require(:project)
      end
  end
end
