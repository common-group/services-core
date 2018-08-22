BEGIN;
    select plan(1);

    select has_view('project_service_api', 'goals',  'view should be defined');

    select * from finish();
ROLLBACK;
