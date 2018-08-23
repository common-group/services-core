local inspect = require 'inspect'
local auth_header = ngx.var.http_Authorization
local token = nil

-- -- ngx.log(ngx.ERR, 'NOTICE FROM REQUEST COMMONS REWRITE')

if auth_header then
    -- generate new token when current api key is valid
    -- return unauthorized when key is invalid
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


if ngx.var.require_pagination == 'on' then
    -- -- ngx.log(ngx.ERR, 'PAGINATION REQUIRED ->>>>'..inspect(ngx.var.require_pagination))
    local limit, offset
    local page_param = tonumber(ngx.var.arg_PAGE) or 1
    local per_page_param = tonumber(ngx.var.arg_PER_PAGE) or 20

    if page_param <= 0 then
        page_param = 1
    end
    if per_page_param > 20 then
        per_page_param = 20
    end
    if per_page_param < 0 then
        per_page_param = 20
    end

    -- ngx.log(ngx.ERR, 'PAGE ->>>>'..inspect(page_param))
    -- ngx.log(ngx.ERR, 'PER_PAGE ->>>>'..inspect(per_page_param))

    limit = per_page_param
    offset = ((page_param*per_page_param)-per_page_param)

    -- ngx.log(ngx.ERR, 'LIMIT ->>>>'..inspect(limit))
    -- ngx.log(ngx.ERR, 'OFFSET ->>>>'..inspect(offset))

    ngx.req.set_uri_args({ limit = limit, offset = offset })
end
