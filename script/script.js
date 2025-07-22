  let index = 0;

  function highlightImages() {
    const images = document.querySelectorAll('.features');

    images.forEach((img, i) => {
      img.classList.toggle('highlight', i === index);
    });

    index = (index + 1) % images.length;
  }

  setInterval(highlightImages, 3000); // every 3 seconds
  window.onload = highlightImages; // highlight first one on load

   document.addEventListener("DOMContentLoaded", () => {
    const cards = document.querySelectorAll('.card');

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          } else {
            entry.target.classList.remove('active');
          }
        });
      },
      {
        threshold: 1, // Trigger when 50% of the card is visible
      }
    );

    cards.forEach(card => {
      observer.observe(card);
    });
  });