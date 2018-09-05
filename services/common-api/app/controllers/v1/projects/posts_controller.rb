# frozen_string_literal: true

module V1
  module Projects
    # PostsController
    # Project owner and platform users can manage their project posts
    class PostsController < ApiBaseController
      before_action :parent
      before_action :authenticate_user!

      def create
        resource = collection
                   .new(permitted_attributes(resource))
                   .tap { |r| r.project = parent }

        authorize resource, :create?
        resource.save

        return render json: resource.errors, status: 400 unless resource.valid?
        render json: { post_id: resource.id }
      end

      def destroy
        resource = collection.find params[:id]
        authorize resource, :destroy?

        return render status: 200, json: { post_id: resource.id, deleted: 'OK' } if resource.destroy
        render status: 400, json: resource.errors
      end

      private

      def policy(record)
        PostPolicy.new(current_user, record)
      end

      def pundit_params_for(record)
        params.require(:post)
      end

      def parent
        @parent ||= current_platform.projects.find params[:project_id]
      end

      def collection
        @collection ||= policy_scope(
          CommonModels::Post,
          policy_scope_class: PostPolicy::Scope
        )
      end
    end
  end
end
