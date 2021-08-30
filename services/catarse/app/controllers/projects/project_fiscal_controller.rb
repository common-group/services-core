# frozen_string_literal: true

module Projects
  class ProjectFiscalController < ApplicationController
    before_action :set_date, only: [:inform]

    inherit_resources
    actions :show
    belongs_to :project

    def debit_note
      fiscal_data = ProjectFiscal.where('project_id = ? AND end_date <= ?', params[:project_id],
        params[:fiscal_date].to_date
      ).order('end_date desc').first
      if fiscal_data.nil?
        redirect_to edit_project_path(params[:project_id], locale: nil)
      else
        authorize fiscal_data
        template = 'project_fiscal_debit_note'
        render "user_notifier/mailer/#{template}", locals: { fiscal_data: fiscal_data }, layout: 'layouts/email'
      end
    end

    def inform
      fiscal_data = ProjectFiscal.where('project_id = ? AND begin_date >= ? AND end_date <= ?', params[:project_id],
        @begin_date, @end_date
      )
      if fiscal_data.nil?
        redirect_to edit_project_path(params[:project_id], locale: nil)
      else
        template = 'project_fiscal_inform'
        render "user_notifier/mailer/#{template}", locals: { fiscal_data: fiscal_data }, layout: 'layouts/email'
      end
    end

    private

    def set_date
      @begin_date = "01/#{params[:fiscal_year]}".to_date.beginning_of_month
      @end_date = "12/#{params[:fiscal_year]}".to_date.end_of_month
    end
  end
end
