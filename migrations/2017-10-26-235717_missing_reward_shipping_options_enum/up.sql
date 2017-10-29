-- Your SQL goes here
create type project_service.shipping_options_enum as enum (
    'free', 
    'national', 
    'international', 
    'presential'
);