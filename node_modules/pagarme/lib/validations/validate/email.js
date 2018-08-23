import { test } from 'ramda'

const validate = test(/^([a-zA-Z0-9_\.\-\+])+@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/)

export default validate
