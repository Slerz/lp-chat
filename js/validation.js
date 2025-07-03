$.validator.addMethod(
  'customName',
  function (value) {
    return /^[a-zA-Zа-яА-ЯёЁ\s'-]+$/.test(value);
  },
);

$.validator.addMethod(
  'email',
  function (value) {
    return /^[a-zA-Z0-9_.%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(value);
  },
);

$.validator.addMethod(
  'phone',
  function (value) {
    return /\+\d{1} \([9]\d{2}\) \d{3} \d{4}/.test(value) && !/(\d)\1{6,}/.test(value.replace(/[^\d]/g, ''));
  },
);

$('form').each(function () {
  $(this).validate({
    errorPlacement: function (error, element) {
      if (element.attr("name") === "agree") {
        error.addClass('error--privacy');
        error.appendTo(element.closest('.agree'));
      }
    },
    rules: {
      name: {
        required: true,
        customName: true,
      },
      city: {
        required: true,
      },
      investammount: {
        required: true,
      },
      answer: {
        required: true,
      },
      email: {
        required: true,
        email: true,
      },
      phone: {
        required: true,
        phone: true,
      },
      agree: {
        required: true,
      },
    },
    messages: {
      agree: 'Подтвердите согласие с политикой конфиденциальности',
    },
  });
});
