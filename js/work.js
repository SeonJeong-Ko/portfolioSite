document.addEventListener('DOMContentLoaded', function () {
  const radios = document.querySelectorAll('input[type="radio"]');
  const pageLabels = document.querySelectorAll('#page label .floor');
  const pageElement = document.getElementById('page');
  const nextFloors = document.querySelectorAll('.nextFloor');

  const modal = document.getElementById("modal");
  const modalIframe = document.getElementById("modal-iframe");
  const closeButton = document.querySelector(".close-button");

  let lastMouseX = window.innerWidth / 2;
  let lastMouseY = window.innerHeight / 2;
  let currentFloor = null;

  //스크롤바
  const progressBar = document.querySelector('.scroll-progress .progress-bar');
  let activeWorkPage = document.querySelector('.workPage.active');

  function updateProgressBar() {
    if (activeWorkPage && activeWorkPage.scrollWidth > activeWorkPage.clientWidth) {
      const scrollLeft = activeWorkPage.scrollLeft;
      const maxScrollLeft = activeWorkPage.scrollWidth - activeWorkPage.clientWidth;
      const scrollPercent = (scrollLeft / maxScrollLeft) * 100;
      progressBar.style.width = `${scrollPercent}%`;
    } else {
      progressBar.style.width = '0%';
    }
  }
  
  // 스크롤 중간에 있는 버튼
  function handleScroll() {
    const scrollPosition = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.body.scrollHeight;
    const threshold = documentHeight - windowHeight * 1.2;
    const isVisible = scrollPosition > windowHeight * 0.1 && scrollPosition < threshold;

    if (isVisible) {
      if (getComputedStyle(pageElement).display === 'none') {
        pageElement.style.display = '';
        pageElement.style.opacity = 0;
        void pageElement.offsetWidth;
        pageElement.style.opacity = 1;
      } else {
        pageElement.style.opacity = 1;
      }
    } else {
      if (pageElement.style.display !== 'none') {
        pageElement.style.opacity = 0;
        pageElement.addEventListener('transitionend', function onTransitionEnd() {
          if (pageElement.style.opacity == 0) {
            pageElement.style.display = 'none';
          }
          pageElement.removeEventListener('transitionend', onTransitionEnd);
        });
      }
    }
    
    nextFloors.forEach(floor => floor.classList.toggle('fixed', scrollPosition >= threshold));
  }

  // let floor = sessionStorage.getItem("currentFloor");
  // if (floor !== null) {
  //   radios[floor].checked = true;
  // }

  //스크롤 초기화
  function resetWorkPageScroll() {
    radios.forEach((radio) => {
      const workPage = radio.closest('.workPage');
      workPage.scrollLeft = 0;
    });
  }

  //작업페이지 스타일 업데이트
  function updateWorkPageStyles() {
    radios.forEach((radio, index) => {
      const workPage = radio.closest('.workPage');
      const pageLabel = pageLabels[index];

      if (radio.checked && currentFloor !== radio.id) {
        currentFloor = radio.id;
        sessionStorage.setItem("currentFloor", index);
        
        document.querySelectorAll('.workPage').forEach(page => page.classList.remove('active'));
        document.querySelectorAll('#page label .floor').forEach(label => label.classList.remove('active'));

        workPage.classList.add('active');
        pageLabel.classList.add('active');

        window.scrollTo({ top: 0, behavior: 'smooth' });

        const itemWork = workPage.querySelector('.item-work');
        const images = itemWork.querySelectorAll('img');

        images.forEach(img => {
          if (!img.src) img.src = img.getAttribute('data-src');
        });

        positionImagesRandomly(itemWork, images);

        activeWorkPage = workPage;
        updateProgressBar();

        if (activeWorkPage.scrollWidth > activeWorkPage.clientWidth) {
          activeWorkPage.addEventListener('scroll', updateProgressBar);
        } else {
          progressBar.style.width = '0%';
        }
      }
    });
    
    updateCursor();
  }
  
  // 이미지 랜덤 배치
  function positionImagesRandomly(container, images) {
    const baseSize = window.innerWidth <= 480 ? 600 : 800;
    const containerWidth = baseSize + images.length * 460;
    const containerHeight = baseSize + images.length * 200;

    container.style.width = `${containerWidth}px`;
    container.style.height = `${containerHeight}px`;

    let placedImages = [];

    images.forEach(img => {
      img.addEventListener('load', () => {
        const imgWidth = img.width;
        const imgHeight = img.height;

        let randomLeft, randomTop, isOverlapping;

        do {
          randomLeft = Math.random() * (containerWidth - imgWidth);
          randomTop = Math.random() * (containerHeight - imgHeight);

          isOverlapping = placedImages.some(placed => {
            return (
              randomLeft < placed.left + placed.width &&
              randomLeft + imgWidth > placed.left &&
              randomTop < placed.top + placed.height &&
              randomTop + imgHeight > placed.top
            );
          });
        } while (isOverlapping);

        img.style.position = 'absolute';
        img.style.left = `${randomLeft}px`;
        img.style.top = `${randomTop}px`;

        placedImages.push({
          left: randomLeft,
          top: randomTop,
          width: imgWidth,
          height: imgHeight
        });
      });

      if (!img.complete) img.src = img.getAttribute('data-src');
    });
  }

  const images = document.querySelectorAll('.item-work img');

  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      } else {
        entry.target.classList.remove('visible');
      }
    });
  }, observerOptions);

  images.forEach(img => {
    imageObserver.observe(img);
  });

  // cursor
  function updateCursor() {
    const cursor = document.querySelector(".cursor");
  
    cursor.style.display = "none";
    document.body.style.cursor = "default";
  
    const activeWorkPage = document.querySelector('.workPage.active');
    if (activeWorkPage) {
      const isInActiveWorkPage = activeWorkPage.contains(document.elementFromPoint(lastMouseX, lastMouseY));
      const isHoveringOverImage = activeWorkPage.querySelector('.item-work img:hover');
      const isHoveringOverNextFloor = document.elementFromPoint(lastMouseX, lastMouseY)?.closest('.nextFloor');

      if (isInActiveWorkPage && !isHoveringOverImage && !isHoveringOverNextFloor) {
        cursor.style.display = "block";
        document.body.style.cursor = "none";
  
        const images = activeWorkPage.querySelectorAll('.item-work img');
        let nearestImage = null;
        let minDistance = Infinity;
        let direction = null;
  
        images.forEach((img) => {
          const rect = img.getBoundingClientRect();
          const imageCenterX = rect.left + rect.width / 2;
          const imageCenterY = rect.top + rect.height / 2;
          const deltaX = imageCenterX - lastMouseX;
          const deltaY = imageCenterY - lastMouseY;
          const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  
          if (distance < minDistance) {
            minDistance = distance;
            nearestImage = img;
  
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
              direction = deltaX > 0 ? 'right' : 'left';
            } else {
              direction = deltaY > 0 ? 'down' : 'up';
            }
          }
        });
  
        if (nearestImage) {
          cursor.classList.remove('up', 'down', 'left', 'right');
          cursor.classList.add(direction);
          cursor.style.top = `${lastMouseY}px`;
          cursor.style.left = `${lastMouseX}px`;
        }
      }
    }
  }
  
  document.addEventListener("mousemove", (e) => {
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    updateCursor();
  });
  
  window.addEventListener('scroll', () => {
    updateCursor();
  });  

  document.addEventListener("mousemove", (e) => {
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    updateCursor();
  });

  window.addEventListener('scroll', () => {
    updateCursor();
  });

  updateWorkPageStyles();
  handleScroll();
  updateCursor();
  updateProgressBar();

  window.addEventListener('scroll', handleScroll);

  radios.forEach((radio) => {
    radio.addEventListener('change', function () {
      resetWorkPageScroll();
      updateWorkPageStyles();
      updateProgressBar();
    });
  });

  // modal
  function openModal(contentSrc, workId, addToHistory = true) {
    modalIframe.src = contentSrc;
    modal.style.display = "block";
    document.body.classList.add('modal-open');
  
    setTimeout(() => {
      modal.querySelector(".modal-content").classList.add("show");
    }, 10);
  
    if (addToHistory) {
      history.pushState({ workId: workId }, "", `?work=${workId}`);
    }
  }
  
  function closeModal(addToHistory = true) {
    modal.querySelector(".modal-content").classList.remove("show");
  
    setTimeout(() => {
      modal.style.display = "none";
      modalIframe.src = "";
      document.body.classList.remove('modal-open');
      
      if (addToHistory) {
        history.pushState({}, "", window.location.pathname);
      }
    }, 300);
  }

  document.querySelectorAll('.item-work img').forEach(img => {
    img.addEventListener('click', function() {
      const contentSrc = img.getAttribute('data-modal-content');
      const workId = img.getAttribute('data-id');
      openModal(contentSrc, workId);
    });
  });

  closeButton.addEventListener('click', function() {
    closeModal();
  });

  window.addEventListener('click', function(event) {
    if (event.target == modal) {
      closeModal();
    }
  });

  window.addEventListener('popstate', function(event) {
    if (event.state && event.state.workId) {
      const workId = event.state.workId;
      const img = document.querySelector(`img[data-id="${workId}"]`);
      if (img) {
        const contentSrc = img.getAttribute('data-modal-content');
        openModal(contentSrc, workId, false);
      }
    } else {
      closeModal(false);
    }
  });

  function checkForModalInURL() {
    const params = new URLSearchParams(window.location.search);
    const workId = params.get('work');
    if (workId) {
      const img = document.querySelector(`img[data-id="${workId}"]`);
      if (img) {
        const contentSrc = img.getAttribute('data-modal-content');
        openModal(contentSrc, workId, false);
      }
    }
  }

  checkForModalInURL();
});
