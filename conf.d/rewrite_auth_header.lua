local auth_header = ngx.var.http_Authorization
local token = nil

if auth_header then
    _, _, token = string.find(auth_header, "Bearer%s+(.+)")

    local pgmoon = require("pgmoon")
    local pg = pgmoon.new({
            host = os.getenv("DB_HOST"),
            port = os.getenv("DB_PORT"),
            database = os.getenv("DB_NAME"),
            user = os.getenv("DB_USERNAME"),
            password = os.getenv("DB_PASSWORD")
        })
    assert(pg:connect())
    local query = "select core.generate_access_jwt_from_api_key("..pg:escape_literal(token)..") as key;"
    query_res = assert(pg:query(query))
    pg:keepalive()
    pg = nil
    if query_res[1].key then
        ngx.req.set_header('Authorization', 'Bearer '..query_res[1].key)
    else
        ngx.exit(ngx.HTTP_UNAUTHORIZED)
    end
end
