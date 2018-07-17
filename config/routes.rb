Rails.application.routes.draw do
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  concern :api_base do
    resources :projects, only: %i[update destroy create] do
      resources :goals, only: %i[update destroy create], controller: 'projects/goals'
    end
  end

  draw :api_v1
end
