class ProjectController < ApplicationController
  post '/:project_id/goals' do
    @project = CommonModels::Project.find params[:project_id]
    return 400 if !@project

    parse_json
    data = JSON.parse @request_payload['data']
    goal = @project.goals.create!(
      {
        external_id: data['external_id'],
        platform_id: @project.platform_id,
        data: data
      }
    )

    return {id: goal.id}.to_json
  end


  patch '/:project_id/goals/:id' do
    @project = CommonModels::Project.find params[:project_id]
    return 400 if !@project

    parse_json
    @goal = @project.goals.find params[:id]
    data = JSON.parse @request_payload['data']
    if @goal.update_attributes!( { data: data })
      return {id: @goal.id}.to_json
    else
      return 400
    end
  end
end
