#!/usr/bin/env ruby

require 'sinatra'
require 'common_models'
require 'pry'

class CommonApi < Sinatra::Base
  extend CommonModels
  set :server, :thin

  before do
    request.body.rewind
    @request_payload = JSON.parse request.body.read
  end

  after do
    ActiveRecord::Base.clear_active_connections!
  end

  post '/projects/:project_id/goals' do
    @project = CommonModels::Project.find params[:project_id]
    return 400 if !@project

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


  patch '/projects/:project_id/goals/:id' do
    @project = CommonModels::Project.find params[:project_id]
    return 400 if !@project

    @goal = @project.goals.find params[:id]
    data = JSON.parse @request_payload['data']
    if @goal.update_attributes!( { data: data })
      return {id: @goal.id}.to_json
    else
      return 400
    end
  end

end

CommonApi.run!
