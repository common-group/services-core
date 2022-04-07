import './legacy/analytics'
import './legacy/replace_diacritics'
import './legacy/jquery'
import './legacy/rails_ujs'

// JS for new session page views/catarse_bootstrap/devise/registrations/new
document.addEventListener('DOMContentLoaded', function () {
  let checkboxShowPassword = document.getElementById('user_show_password');
  let inputPassword = document.getElementById('user_password');

  if (checkboxShowPassword && inputPassword) {
    checkboxShowPassword.addEventListener('change', function () {
      if (this.checked == true) {
        inputPassword.type = 'text';
      } else {
        inputPassword.type = 'password';
      }
    });
  }
});
