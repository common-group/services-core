# frozen_string_literal: true

class ProjectIndexAction
  attr_reader :project_index, :project, :user

  def initialize(project_id:, user:)
    @project_index = JSON.parse(ProjectsIndex.query(match: { project_id: project_id }).to_json)
    @project = Project.find project_id
    @user = user
  rescue StandardError => e
    Sentry.capture_exception(e, level: :fatal)
  end

  def call
    project_attributes = project_index.first['attributes']
    return {} if project_attributes.blank?

    project_attributes.merge!(add_key)
  rescue StandardError => e
    Sentry.capture_exception(e, level: :fatal)
  end

  private

  def add_key
    {
      'contributed_by_friends' => contributed_by_friends,
      'in_reminder' => in_reminder,
      'saved_projects' => saved_projects,
      'admin_tag_list' => admin_tag_list,
      'admin_notes' => admin_notes,
      'can_cancel' => can_cancel
    }
  end

  def contributed_by_friends
    ActiveRecord::Base.connection.execute(
      "SELECT true AS bool FROM (contributions c_1
      JOIN user_follows uf ON ((uf.follow_id = c_1.user_id)))
      WHERE (is_confirmed(c_1.*) AND (uf.user_id = #{user.admin ? project.user.id : user.id})
      AND (c_1.project_id = #{project.id}))"
    ).values.first.present?
  end

  def in_reminder
    ProjectNotification.where(
      template_name: 'reminder',
      project_id: project.id,
      user_id: (user.admin ? project.user_id : user.id)
    ).present?
  end

  def saved_projects
    ProjectReminder.where(project_id: project.id, user_id: (user.admin ? project.user.id : user.id)).present?
  end

  def admin_tag_list
    ActiveRecord::Base.connection.exec_query(
      ActiveRecord::Base.sanitize_sql(
        [
          %{SELECT CASE WHEN (:is_admin) THEN NULLIF(btrim(( array_agg(DISTINCT
            (SELECT t1.name AS tag_list FROM (taggings tgs JOIN tags t1 ON ((t1.id = tgs.tag_id)))
            WHERE ((tgs.project_id = #{project.id}) AND (tgs.tag_id IS NOT NULL)))
            ))::text, '{}'::text), 'NULL'::text) ELSE NULL::text END AS admin_tag_list
          }.squish,
          { is_admin: user.admin? }
        ]
      )
    ).rows.first.first
  end

  def admin_notes
    user.admin ? project.admin_notes : nil
  end

  def can_cancel
    if project.user_id == user.id || user.admin?
      project.pluck_from_database('can_cancel')
    else
      false
    end
  end
end
