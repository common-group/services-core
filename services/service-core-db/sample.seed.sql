insert into core.core_settings(name, value)
    values ('jwt_secret', 'bUH75katNm6Yj0iPSchcgUuTwYAzZr7C'),
    ('subscription_interval', '1 month');

insert into platform_service.users(id, name, email, password)
    values ('6d870ed7-65c7-4419-b78b-3946e6f6e695', 'Demo platform account', 'demo@demo.com', crypt('123456', gen_salt('bf')));

insert into platform_service.platforms(id, name, token)
    values ('8187a11e-6fa5-4561-a5e5-83329236fbd6', 'demo platform', 'a28be766-bb36-4821-82ec-768d2634d78b');

insert into platform_service.platform_users(platform_id, user_id) values ('8187a11e-6fa5-4561-a5e5-83329236fbd6', '6d870ed7-65c7-4419-b78b-3946e6f6e695');

insert into platform_service.platform_api_keys(platform_id, token)
    values('8187a11e-6fa5-4561-a5e5-83329236fbd6', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoicGxhdGZvcm1fdXNlciIsInBsYXRmb3JtX3Rva2VuIjoiYTI4YmU3NjYtYmIzNi00ODIxLTgyZWMtNzY4ZDI2MzRkNzhiIiwiZ2VuX2F0IjoxNTA0MTMzNDQwfQ.kDTJb9HVmCMf8PIX0ZSwWr2CtJ0QjZgaNgk2qTJttjg'),
    ('8187a11e-6fa5-4561-a5e5-83329236fbd6', 'fc975e84cd927457f023bdc06d9bdf6209cf4d2dfbfae2702286f86ec1f8941b350a7a8ab3c52e8adda04c6441fd95a94b4bcfd9dbc7457c059e232ec8649dd9');
