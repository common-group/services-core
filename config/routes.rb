Rails.application.routes.draw do
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  concern :api_base do
    resources :projects, only: %i[update destroy create] do
      resources :goals, only: %i[update destroy create], controller: 'projects/goals'
      resources :reports, only: %i[create], controller: 'projects/reports'
    end
    resources :users do
      collection do
        post :login, controller: 'users/sessions'
        post :logout, controller: 'users/sessions'
      end
    end
  end

  draw :api_v1
end
