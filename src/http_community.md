# Community service API

supported endpoints:

| | required role | description |
| :--- | :--- | :--- |
| **POST** `/rpc/user` | platform\_user, scoped\_user | create new user or update when id is passed or role is scoped\_user |
| **POST** `/rpc/create_scoped_user_session` | platform\_user | create a scoped user api token for given id for 2 hours |
| **GET ** `/users` | platform\_user | list users on platform |
