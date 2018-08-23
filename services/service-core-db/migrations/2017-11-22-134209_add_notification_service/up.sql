-- Your SQL goes here
create schema notification_service;
create schema notification_service_api;

create table notification_service.notification_layouts (
    id uuid default public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    platform_id uuid not null references platform_service.platforms(id),
    label text not null,
    template text not null,
    deleted_at timestamp,
    created_at timestamp not null default now(),
    updated_at timestamp not null default now(),
    CONSTRAINT chk_label CHECK ((label~* '\A(\w|_)*\Z'::text))
);

create table notification_service.notification_global_templates (
    id uuid default public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    label text not null,
    template text not null,
    created_at timestamp not null default now(),
    updated_at timestamp not null default now(),
    CONSTRAINT chk_label CHECK ((label~* '\A(\w|_)*\Z'::text))
);

create table notification_service.notification_templates (
    id uuid default public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    notification_layout_id uuid references notification_service.notification_layouts(id),
    platform_id uuid not null references platform_service.platforms(id),
    label text not null,
    template text not null,
    created_at timestamp not null default now(),
    updated_at timestamp not null default now(),
    deleted_at timestamp,
    CONSTRAINT chk_label CHECK ((label~* '\A(\w|_)*\Z'::text))
);

create table notification_service.notifications (
    id uuid default public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    platform_id uuid not null references platform_service.platforms(id),
    user_id uuid not null references community_service.users(id),
    notification_template_id uuid references notification_service.notification_templates(id),
    notification_global_template_id uuid references notification_service.notification_global_templates(id),
    data jsonb not null default '{}'::jsonb,
    mail_server_data jsonb,
    deleted_at timestamp,
    deliver_at timestamp not null default now(),
    delivered_at timestamp,
    created_at timestamp not null default now(),
    updated_at timestamp not null default now()
);

create or replace function notification_service.notify(label text, data json) returns notification_service.notifications
    language plpgsql
    volatile
    as $$
        declare
            _user community_service.users;
            _notification_template notification_service.notification_templates;
            _notification_global_template notification_service.notification_global_templates;
            _notification notification_service.notifications;
        begin
            select * from community_users
                where id = $2->>'user_id'::uuid 
                into _user;
            if _user.id is null then
                raise 'user_id not found';
            end if;
            
            select nt.* from notification_service.notification_templates nt  
                where nt.platform_id = _user.platform_id
                    and nt.label = $1
                    into _notification_template;

            if _notification_template is null then
                select ngt.* from notification_service.notification_global_templates ngt
                    where ngt.label = $1
                    into _notification_global_template;

                if _notification_global_template is null then
                    return null;
                end if;
            end if;

            insert into notification_service.notifications
                (platform_id, user_id, notification_template_id, notification_global_template_id, deliver_at, data)
            values (_user.platform_id, _user.id, _notification_template.id, _notification_global_template.id, ($2->>'deliver_at')::timestamp, ($2)::jsonb)
            returning * into _notification;

            if _notification.deliver_at <= now() and not (($2->>'supress_notify')::boolean) then
                perform pg_notify('dispatch_notifications_channel', json_build_object('id', _notification.id));
            end if;

            return _notification;
        end;
    $$;
