# Community service API

supported endpoints:

| | required role | description |
| :--- | :--- | :--- |
| **POST** [/rpc/user](./http_community_rpc_user.md) | `platform_user`, `scoped_user` | create new user or update when id is passed or role is scoped\_user |
| **POST** [/rpc/create_scoped_user_session](./http_community_rpc_create_scoped_user_session.md) | `platform_user` | create a scoped user api token for given id for 2 hours |
| **GET ** [/users](./http_community_users.md) | `platform_user` | list users on platform |
