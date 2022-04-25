# frozen_string_literal: true

class RewardCardComponentPreview < ViewComponent::Preview

  def project 
    reward = { value: '20', title: 'Titulo da Recompensa', description: description, estimated_delivery_time: 'mês/ano', delivery_type: 'Brasil', image: 'bg-quemsomos.jpg' }
    render Catarse::Organism::RewardCardComponent.new(reward: reward)
  end

  def project_without_image
    reward = { value: '20', title: 'Titulo da Recompensa', description: description, estimated_delivery_time: 'mês/ano', delivery_type: 'Brasil' }
    render Catarse::Organism::RewardCardComponent.new(reward: reward)
  end

  def project_with_only_estimated_delivery_time    
    reward = { value: '20', title: 'Titulo da Recompensa', description: description, estimated_delivery_time: 'mês/ano', image: 'bg-quemsomos.jpg' }
    render Catarse::Organism::RewardCardComponent.new(reward: reward)
  end
  
  private

  def description
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
     Nam est eros, eleifend non nisi non, bibendum aliquet justo. 
     In tincidunt sem tempus pellentesque mollis. 
     In a ligula vel purus ultrices gravida non quis enim. 
     Sed eget urna sed orci molestie ornare. 
     Suspendisse euismod metus vitae hendrerit pretium. 
     Praesent neque mi, viverra at aliquet eget, scelerisque non magna. 
     Cras tempus mauris id posuere vestibulum. Suspendisse in sapien nulla. 
     Vestibulum elementum commodo odio sit amet dictum.'
  end
end
