module V1
  class CountriesController < ApiBaseController
      before_action :authenticate_user!
      before_action :resource, except: %i[create]

      def create
        @country = CommonModels::Country.new(permitted_attributes(@country))
        @country.tap { |p| p.platform = current_platform }

        authorize @country
        @country.save

        return render json: @country.errors, status: 400 unless @country.valid?
        render json: { country_id: @country.id }
      end

      private

      def resource
        @country ||= current_platform.countries.find params[:id]
      end

      def policy(record)
        CountryPolicy.new((current_user.presence||current_platform_user.presence), record)
      end

      def pundit_params_for(record)
        params.require(:country)
      end
  end
end
