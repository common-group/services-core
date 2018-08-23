import {
  anyPass,
} from 'ramda'

import { cnpj, cpf } from './cnpjAndCpf'
import email from './email'
import card from './card'
import numberSize from './numberSize'

const ddd = numberSize(2)
const phone = anyPass([numberSize(8), numberSize(9)])
const zipcode = numberSize(8)

export default {
  card,
  cnpj,
  cpf,
  ddd,
  email,
  phone,
  zipcode,
}
