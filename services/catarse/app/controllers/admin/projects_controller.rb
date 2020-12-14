# frozen_string_literal: true

class Admin::ProjectsController < Admin::BaseController
  layout 'catarse_bootstrap'

  has_scope :by_user_email, :by_id, :pg_search, :user_name_contains, :with_state, :by_category_id, :order_by
  has_scope :between_created_at, :between_expires_at, :between_online_at, :between_updated_at, :goal_between, using: %i[start_at ends_at]

  before_action do
    @total_projects = Project.count(:all)
  end

  %i[reject push_to_draft push_to_trash push_to_online].each do |name|
    define_method name do
      @project = Project.find params[:id]
      @project.send(name.to_s)
      redirect_back(fallback_location: admin_projects_path)
    end
  end

  def revert_or_finish
    @project = SubscriptionProject.find params[:id]
    if @project.subscriptions.active_and_started.exists?
      @project.finish
    else
      @project.push_to_draft
    end

    @project.reload

    render json: {project_id: @project.id, current_state: @project.state}
  end

  def destroy
    @project = Project.find params[:id]
    @project.push_to_trash if @project.can_push_to_trash?

    redirect_to admin_projects_path
  end

  def update
    resource.update(permitted_params)
    super
  end

  protected

  def permitted_params
    require_model = params.key?(:flexible_project) ? :flexible_project : :project
    params.require(require_model).permit(resource.attribute_names.map(&:to_sym))
  end

  def collection
    @scoped_projects = apply_scopes(Project).without_state('deleted')
    @projects = @scoped_projects.page(params[:page])
  end
end
