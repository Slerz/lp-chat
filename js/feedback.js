function filterInvalidCharacters() {
  $('input[name="name"]').on('input', function() {
    let value = $(this).val();
    $(this).val(value.replace(/[^a-zA-Zа-яА-ЯёЁ ]/g, ''));
  });
}

function setInitialFeedbackStore() {
  $.feedback_store = {
    phone: '',
    email: '',
    name: '',
    city: '',
    question: '',
    timezone: (-1 * new Date().getTimezoneOffset()) / 60,
    utm_medium: $.query.get('utm_medium') || '',
    utm_placement: $.query.get('utm_placement') || '',
    utm_source: $.query.get('utm_source') || '',
    utm_term: $.query.get('utm_term') || '',
    utm_content: $.query.get('utm_content') || '',
    utm_campaign: $.query.get('utm_campaign') || '',
    utm_campaign_name: $.query.get('utm_campaign_name') || '',
    device_type: $.query.get('device_type') || '',
    utm_region_name: $.query.get('utm_region_name') || '',
    utm_placement: $.query.get('utm_placement') || '',
    utm_description: $.query.get('utm_description') || '',
    utm_device: $.query.get('utm_device') || '',
    page_url: window.location.href,
    user_location_ip: '',
    yclid: $.query.get('yclid') || '',
  }
}

function createFormData(data) {
  var formData = new FormData()

  Object.entries(data).forEach(([key, value]) => {
    if (value) {
      formData.append(key, value)
    }
  })

  return formData
}

function getUTMData() {
  return {
    utm_source: $.query.get('utm_source') || '',
    utm_medium: $.query.get('utm_medium') || '',
    utm_campaign: $.query.get('utm_campaign') || '',
    utm_content: $.query.get('utm_content') || '',
    utm_term: $.query.get('utm_term') || '',
    utm_device: $.query.get('utm_device') || '',
    utm_campaign_name: $.query.get('utm_campaign_name') || '',
    utm_placement: $.query.get('utm_placement') || '',
    utm_description: $.query.get('utm_description') || '',
    page_url: window.location.href,
    user_location_ip: '',
  };
}

function initFeedbackForm() {
  const $forms = $('[data-feedback-form]')

  $forms.on('submit', function (event) {
    event.preventDefault()

    // Проверка на заполнение honeypot-поля
    if ($(this).find('.honeypot').val() !== '') {
      return
    }

    if ($(this).valid()) {
      var fields = $(this)
        .serializeArray()
        .reduce(function (acc, current) {
          return $.extend(acc, { [current.name]: current.value })
        }, {})

      sessionStorage.removeItem('lead_name')
      sessionStorage.removeItem('city')

      if (fields.name) {
        sessionStorage.setItem('lead_name', fields.name)
      }

      if (fields.city) {
        sessionStorage.setItem('city', fields.city)
      }

      // Подготавливаем данные для отправки на ваш PHP endpoint
      var formData = {
        name: fields.name || '',
        phone: fields.phone || '',
        ...getUTMData()
      }

      // Отправляем данные на ваш PHP endpoint
      $.ajax('https://charismatic-intuition-production.up.railway.app/api/send_contact.php', {
        type: 'POST',
        data: JSON.stringify(formData),
        contentType: 'application/json',
        dataType: 'json',
        success: function(response) {
          if (response.success) {
            // window.location = 'thanks.html'
          } else {
            alert('Ошибка отправки: ' + (response.message || 'Неизвестная ошибка'))
          }
        },
        error: function(xhr, status, error) {
          console.error('Ошибка отправки формы:', error)
          alert('Ошибка отправки формы. Попробуйте еще раз.')
        }
      })
    }
  })
}

function initAnchorBtn() {
  $('[data-scroll-top]').on('click', function () {
    $('.modal-scrollable').animate(
      {
        scrollTop: 0,
      },
      1000,
    )
  })
}

function setCurrentYear() {
  $('[data-current-year]').text(new Date().getFullYear())
}

function initCloseCookie() {
  $('[data-cookie-btn]').on('click', function() {
    $('.page-cookie').fadeOut(200);
  });
}

$(document).ready(function () {
  initFeedbackForm()
  setInitialFeedbackStore()

  filterInvalidCharacters()
  $('input').inputmask()

  initAnchorBtn()
  setCurrentYear()
  initCloseCookie()
})
