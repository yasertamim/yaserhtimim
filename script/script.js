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