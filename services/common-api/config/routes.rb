Rails.application.routes.draw do
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  concern :api_base do
    resources :projects, only: %i[update destroy create] do
      resources :goals, only: %i[update destroy create], controller: 'projects/goals'
      resources :contributions, only: %i[update create], controller: 'projects/contributions'
      resources :reports, only: %i[create], controller: 'projects/reports'
      resources :posts, only: %i[create destroy], controller: 'projects/posts'
      resources :rewards, only: %i[create update destroy], controller: 'projects/rewards'
    end
    resources :users do
      collection do
        post :login, controller: 'users/sessions'
        post :logout, controller: 'users/sessions'
      end
    end
    resources :api_keys, only: %i[create destroy]
    resources :direct_messages, only: %i[create]
    resources :addresses, only: %i[create update]
    resources :states, only: %i[create], controller: 'states'
    resources :countries, only: %i[create], controller: 'countries'
    resources :subscriptions do
      member do
        match 'set_anonymity_state' => 'subscriptions#set_anonymity_state', :as => 'set_anonymity_state', :via => [:post, :options]
      end
      
      #member do
      #  post  :set_anonymity_state, to: 'subscriptions#set_anonymity_state'
      #end
    end
  end

  draw :api_v1
end
