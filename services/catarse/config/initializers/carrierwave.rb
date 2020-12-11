require 'fog/aws'

CarrierWave.configure do |config|
  if CatarseSettings.get_without_cache(:aws_access_key)
    config.fog_provider = 'fog/aws'
    config.fog_credentials = {
      provider: 'AWS',
      region: CatarseSettings.get_without_cache(:aws_region),
      endpoint: "https://#{CatarseSettings.get_without_cache(:aws_host)}",
      aws_access_key_id: CatarseSettings.get_without_cache(:aws_access_key),
      aws_secret_access_key: CatarseSettings.get_without_cache(:aws_secret_key),
      path_style: true
    }
    config.fog_directory  = CatarseSettings.get_without_cache(:aws_bucket)
    config.fog_attributes = { 'Cache-Control' => 'max-age=315576000' } # optional, defaults to {}
  else
    config.enable_processing = false if Rails.env.test? || Rails.env.cucumber?
  end
end

module CarrierWave
  module MiniMagick
    def quality(percentage)
      manipulate! do |img|
        img.quality(percentage.to_s)
        img = yield(img) if block_given?
        img
      end
    end
  end
end
