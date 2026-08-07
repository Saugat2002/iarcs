document.addEventListener('DOMContentLoaded', function () {
  // Results carousel (bulma-carousel). Safe no-op if the element is absent.
  if (window.bulmaCarousel && document.getElementById('results-carousel')) {
    bulmaCarousel.attach('#results-carousel', {
      slidesToScroll: 1,
      slidesToShow: 2,
      loop: true,
      infinite: true,
      autoplay: true,
      autoplaySpeed: 4000,
      breakpoints: [
        { changePoint: 768, slidesToShow: 1, slidesToScroll: 1 }
      ]
    });
  }

  if (window.bulmaSlider) {
    bulmaSlider.attach();
  }
});
