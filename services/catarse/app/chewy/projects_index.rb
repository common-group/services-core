# frozen_string_literal: true

class ProjectsIndex < Chewy::Index  # rubocop:disable Metrics/ClassLength
  index_scope Project.where.not(state: 'deleted').joins(
    "JOIN users u ON projects.user_id = u.id
    LEFT JOIN project_score_storages pss ON pss.project_id = projects.id
    LEFT JOIN project_metric_storages pms ON pms.project_id = projects.id
    LEFT JOIN cities c ON c.id = projects.city_id
    LEFT JOIN states s ON s.id = c.state_id
    JOIN LATERAL zone_timestamp(online_at(projects)) od(od) ON true
    JOIN LATERAL state_order(projects) so(so) ON true
    LEFT JOIN categories category ON category.id = projects.category_id"
  ), delete_if: :deleted_at

  field :project_id, value: ->(project) { project.id }
  field :category_id
  field :project_name, value: ->(project) { project.name }
  field :headline
  field :permalink
  field :mode
  field :state
  field :state_order, value: ->(project) { project.pluck_from_database('state_order') }
  field :online_date, value: ->(project) { project.online_at }
  field :recommended
  field :project_img, value: ->(project) { project.pluck_from_database('thumbnail_image') }
  field :remaining_time, type: 'object', value: ->(project) { project.time_to_go }
  field :expires_at, type: 'date'
  field :cover_image, value: ->(project) { project.pluck_from_database('cover_image_thumb') }
  field :original_image, value: ->(project) { project.pluck_from_database('original_image') }
  field :thumb_image, value: lambda { |project|
    Project.where(id: project.id).pick(Arel.sql("thumbnail_image(projects, 'thumb'::text)"))
  }
  field :small_image, value: lambda { |project|
    Project.where(id: project.id).pick(Arel.sql("thumbnail_image(projects, 'small'::text)"))
  }
  field :large_image, value: lambda { |project|
    Project.where(id: project.id).pick(Arel.sql("thumbnail_image(projects, 'large'::text)"))
  }
  field :video_cover_image, value: lambda { |project|
    Project.where(id: project.id).pick(Arel.sql("thumbnail_image(projects, 'video_cover'::text)"))
  }
  field :pledged, value: ->(project) { project.project_metric_storage.try(:data).to_h.fetch('pledged', 0) }
  field :progress, value: ->(project) { project.project_metric_storage.try(:data).to_h.fetch('progress', 0) }
  field :total_contributions, value: lambda { |project|
    project.project_metric_storage.try(:data).to_h.fetch('total_contributions', 0)
  }
  field :total_contributors, value: lambda { |project|
    project.project_metric_storage.try(:data).to_h.fetch('total_contributors', 0)
  }

  field :state_acronym, value: ->(project) { project.city&.state&.acronym }
  field :owner_name, value: ->(project) { project.user.name }
  field :city_name, value: ->(project) { project.city&.name }
  field :city_id, value: ->(project) { project.city&.id }
  field :full_text_index
  field :open_for_contributions, value: lambda { |project|
    project.pluck_from_database('open_for_contributions')
  }
  field :elapsed_time, type: 'object', value: ->(project) { project.elapsed_time }
  field :score, value: ->(project) { project.project_score_storage&.score || 0 }
  field :project_user_id, value: ->(project) { project.user.id }
  field :video_embed_url
  field :video_url
  field :tracker_snippet_html
  field :service_fee
  field :online_days
  field :updated_at, type: 'date'
  field :owner_public_name, value: ->(project) { project.user.public_name }
  field :zone_expires_at, type: 'date', value: ->(project) { project.expires_at }
  field :zone_online_date, type: 'date', value: lambda { |project|
    Project.where(id: project.id).pick(Arel.sql('zone_timestamp(online_at(projects))'))
  }
  field :sent_to_analysis_at, value: lambda { |project|
    Project.where(id: project.id).pick(Arel.sql('zone_timestamp(in_analysis_at(projects))'))
  }
  field :is_published, value: lambda { |project|
    project.pluck_from_database('is_published')
  }
  field :has_cancelation_request, value: lambda { |project|
    project.pluck_from_database('has_cancelation_request')
  }
  field :is_expired, value: lambda { |project|
    project.pluck_from_database('is_expired')
  }
  field :common_id
  field :service_fee
  field :is_adult_content, value: ->(project) { project.content_rating >= 18 }
  field :content_rating
  field :can_request_transfer, value: lambda { |project|
    project.state == 'successful' && project.expires_at >= '2016-06-06'.to_date
  }
  field :category, value: ->(project) { project.category.name_pt || project.category.name_en }
  field :posts_count, value: ->(project) { ProjectPost.where(project_id: project.id).count }

  field :user, value: lambda { |project|
    { user_id: project.user.id, user_name: project.user.name, user_public_name: project.user.public_name }.to_json
  }

  field :address, value: lambda { |project|
    {
      city_name: project&.city&.name,
      state_acronym: project&.city&.state&.acronym,
      state_name: project&.city&.state&.name
    }.to_json
  }

  field :reminder_count, value: ->(project) { ProjectReminder.where(project_id: project.id).count }

  field :integrations, value: lambda { |project|
    ActiveRecord::Base.connection.exec_query(
      %{SELECT CASE
        WHEN ((SELECT count(1) AS count FROM project_integrations pi WHERE (pi.project_id = #{project.id})) > 0)
        THEN (SELECT json_agg(json_build_object(
          'id', integration.id, 'name', integration.name, 'data', integration.data
        )) AS json_agg FROM project_integrations integration
        WHERE (#{project.id} = integration.project_id)) ELSE '[]'::json END AS integrations
      }.squish
    ).rows.first.first
  }
end
