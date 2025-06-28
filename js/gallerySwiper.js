function renderGallerySwiper(swiperItems) {
  const chatContent = document.getElementById("chatContent");
  const itemsTemplate = swiperItems.map(({ src }) => `
    <div class="swiper-slide">
      <div>
        <img class="tap-color" src="${src}" alt="${src.split('/').pop()}" />
      </div>
    </div>
  `);

  const template = `
    <div class="swiper-container swiper-chat">
      <div class="swiper-wrapper">
        ${itemsTemplate.join('')}
      </div>
      <div class="gallery-pagination swiper-bullets"></div>
    </div>
  `;

  const element = new DOMParser()
    .parseFromString(template, "text/html")
    .body
    .firstElementChild;

  chatContent.appendChild(element);
  if (typeof animateFadeIn === 'function') animateFadeIn(element);
  if (typeof smoothScrollToBottom === 'function') smoothScrollToBottom();

  new Swiper(element, {
    speed: 450,
    effect: 'slide',
    rewind: true,
    grabCursor: true,
    pagination: {
      el: '.gallery-pagination',
      clickable: true,
    },
    breakpoints: {
      200: {
        spaceBetween: 10,
        slidesPerView: 1,
      },
      768: {
        spaceBetween: 14,
        slidesPerView: 3,
      },
      1400: {
        spaceBetween: 22,
        slidesPerView: 3,
      },
    },
  });
}

export default renderGallerySwiper; 