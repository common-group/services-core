module CommonModels
  # Default config
  @config = {
    adapter: "postgresql",
    encoding: "unicode",
    host: "localhost",
    database: "service_core",
    pool: 5,
    port: 5444,
    username: "postgres",
    password: "example"
  }

  @valid_config_keys = @config.keys

  # Configure through hash
  def self.configure(opts = {})
    opts.each {|k,v| @config[k.to_sym] = v if @valid_config_keys.include? k.to_sym}
  end

  def self.configure_with_url(url)
    @config = url
  end

  # Configure through yaml file
  def self.configure_with_yaml(path_to_yaml_file)
    begin
      config = YAML::load(IO.read(path_to_yaml_file))
    rescue Errno::ENOENT
      log(:warning, "YAML configuration file couldn't be found. Using defaults."); return
    rescue Psych::SyntaxError
      log(:warning, "YAML configuration file contains invalid syntax. Using defaults."); return
    end

    configure(config)
  end

  def self.config
    @config
  end

end
