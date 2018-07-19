module V1
  class Projects::GoalsController < ApiBaseController
    before_action :parent, except: %i[create]
    before_action :authenticate_user!
    #after_action :verify_authorized

    def create
      resource = parent.goals.new(permitted_attributes(resource))
        .tap {|g| g.platform = current_platform }

      authorize resource, :create?
      resource.save
      return render json: resource.errors, status: 400 unless resource.valid?
      render json: { goal_id: resource.id }
    end

    def update
      render json: { message: 'updating new goal' }
    end

    def destroy
      render json: { message: 'delete new goal' }
    end

    def policy(record)
      GoalPolicy.new(current_user, record)
    end

    def pundit_params_for(record)
      params.require(:goal)
    end

    def parent
      @resource ||= current_platform.projects.find params[:project_id]
    end
  end
end
