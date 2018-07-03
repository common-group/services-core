require 'sinatra/base'

# pull in the controllers
Dir.glob('./app/{controllers}/*.rb').each { |file| require file }

# map the controllers to routes
map('/projects') { run ProjectController }
map('/') { run ApplicationController }
