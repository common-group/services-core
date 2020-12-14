class AddIpAddressToProjectAndGrants < ActiveRecord::Migration[4.2]
  def change
    execute %Q{
    grant usage on sequence public.project_transitions_id_seq to admin, web_user;
    }

    add_column :projects, :ip_address, :text
  end
end
