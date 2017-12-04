-- This file should undo anything in `up.sql`
DROP FUNCTION core_validator.verify_cpf(text);
DROP FUNCTION core_validator.verify_cnpj(text);