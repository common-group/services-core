-- Your SQL goes here
CREATE OR REPLACE FUNCTION core_validator.verify_cpf(text)
RETURNS BOOLEAN AS $$
-- se o tamanho for 11 prossiga com o cálculo
-- senão retorne falso
SELECT CASE WHEN LENGTH($1) = 11 THEN
(
  -- verifica se os dígitos coincidem com os especificados
  SELECT
      SUBSTR($1, 10, 1) = CAST(digit1 AS text) AND
      SUBSTR($1, 11, 1) = CAST(digit2 AS text)
  FROM
  (
    -- calcula o segundo dígito verificador (digit2)
    SELECT
        -- se o resultado do módulo for 0 ou 1 temos 0
        -- senão temos a subtração de 11 pelo resultado do módulo
        CASE res2
        WHEN 0 THEN 0
        WHEN 1 THEN 0
        ELSE 11 - res2
        END AS digit2,
        digit1
    FROM
    (
      -- soma da multiplicação dos primeiros 9 dígitos por 11, 10, ..., 4, 3
      -- obtemos o módulo da soma por 11
      SELECT
          MOD(SUM(m * CAST(SUBSTR($1, 12 - m, 1) AS INTEGER)) + digit1 * 2, 11) AS res2,
          digit1
      FROM
      generate_series(11, 3, -1) AS m,
      (
        -- calcula o primeiro dígito verificador (digit1)
        SELECT
            -- se o resultado do módulo for 0 ou 1 temos 0
            -- senão temos a subtração de 11 pelo resultado do módulo
            CASE res1
            WHEN 0 THEN 0
            WHEN 1 THEN 0
            ELSE 11 - res1
            END AS digit1
        FROM
        (
          -- soma da multiplicação dos primeiros 9 dígitos por 10, 9, ..., 3, 2
          -- obtemos o módulo da soma por 11
          SELECT
              MOD(SUM(n * CAST(SUBSTR($1, 11 - n, 1) AS INTEGER)), 11) AS res1
          FROM generate_series(10, 2, -1) AS n
        ) AS sum1
      ) AS first_digit
      GROUP BY digit1
    ) AS sum2
  ) AS first_sec_digit
)
ELSE FALSE END;
$$ LANGUAGE SQL
IMMUTABLE STRICT;


CREATE OR REPLACE FUNCTION core_validator.verify_cnpj(text)
RETURNS BOOLEAN AS $$
-- se o tamanho for 14 prossiga com o cálculo
-- senão retorne falso
SELECT CASE WHEN LENGTH($1) = 14 THEN
(
  -- verifica se os dígitos coincidem com os especificados
  SELECT
      SUBSTR($1, 13, 1) = CAST(digit1 AS text) AND
      SUBSTR($1, 14, 1) = CAST(digit2 AS text)
  FROM
  (
    -- calcula o segundo dígito verificador (digit2)
    SELECT
        -- se o resultado do módulo for 0 ou 1 temos 0
        -- senão temos a subtração de 11 pelo resultado do módulo
        CASE res2
        WHEN 0 THEN 0
        WHEN 1 THEN 0
        ELSE 11 - res2
        END AS digit2,
        digit1
    FROM
    (
      -- soma da multiplicação dos primeiros 9 dígitos por 11, 10, ..., 4, 3
      -- obtemos o módulo da soma por 11
      SELECT MOD(SUM(res2) + digit1 * 2, 11) AS res2,
          digit1
      FROM
      (
        SELECT
            SUM(m * CAST(SUBSTR($1, 7 - m, 1) AS INTEGER)) AS res2
        FROM
        (
          SELECT generate_series(6, 2, -1) AS m
        ) AS m11
        UNION ALL
        SELECT
            SUM(m * CAST(SUBSTR($1, 15 - m, 1) AS INTEGER)) AS res2
        FROM
        (
          SELECT generate_series(9, 3, -1) AS m
        ) AS m12
      ) AS m2,
      (
        -- calcula o primeiro dígito verificador (digit1)
        SELECT
            -- se o resultado do módulo for 0 ou 1 temos 0
            -- senão temos a subtração de 11 pelo resultado do módulo
            CASE res1
            WHEN 0 THEN 0
            WHEN 1 THEN 0
            ELSE 11 - res1
            END AS digit1
        FROM
        (
          -- soma da multiplicação dos primeiros 12 dígitos por 5, 4, 3, 2, 9, 8, 7, ..., 3, 2
          -- obtemos o módulo da soma por 11
          SELECT MOD(SUM(res1), 11) AS res1
          FROM
          (
            SELECT
                SUM(n * CAST(SUBSTR($1, 6 - n, 1) AS INTEGER)) AS res1
            FROM
            (
              SELECT generate_series(5, 2, -1) AS n
            ) AS m11
            UNION ALL
            SELECT
                SUM(n * CAST(SUBSTR($1, 14 - n, 1) AS INTEGER)) AS res1
            FROM
            (
              SELECT generate_series(9, 2, -1) AS n
            ) AS m12
          ) AS m1
        ) AS sum1
      ) AS first_digit
      GROUP BY digit1
    ) AS sum2
  ) AS first_sec_digit
)
ELSE FALSE END;
 
$$ LANGUAGE SQL
IMMUTABLE STRICT;