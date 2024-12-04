document.addEventListener("DOMContentLoaded", function () {
  const text = "HELLO!";
  const introElement = document.getElementById("intro");
  const cards = document.querySelectorAll(".card");

  let index = 0;
  let cardIndex = 0;
  let isHelloState = true;

  // cursorText
  const cursorText = document.createElement("div");
  cursorText.classList.add("cursor-text");
  cursorText.textContent = "click me!";
  document.body.appendChild(cursorText);

  let cursorX = window.innerWidth / 2;
  let cursorY = window.innerHeight * 0.7;
  let targetX = cursorX;
  let targetY = cursorY;
  let isInitialPosition = true;

  function updateCursorPosition() {
    const speed = 0.1;
    cursorX += (targetX - cursorX) * speed;
    cursorY += (targetY - cursorY) * speed;

    cursorText.style.left = `${cursorX}px`;
    cursorText.style.top = `${cursorY}px`;

    requestAnimationFrame(updateCursorPosition);
  }

  function setCursorCenterStyle(center) {
    if (center) {
      cursorText.style.transform = "translate(-50%, -50%)";
    } else {
      cursorText.style.transform = "translate(10px, 10px)";
    }
  }

  // 'HELLO!' animation
  function typeText() {
    introElement.style.pointerEvents = "auto";
    introElement.textContent = "";
    index = 0;

    function type() {
      if (index < text.length) {
        introElement.textContent += text[index];
        index++;
        setTimeout(type, 180);
      }
    }
    type();
  }

  // nextCard
  function showNextCard() {
    if (isHelloState) {
      introElement.style.opacity = 0;
      introElement.style.pointerEvents = "none";
      isHelloState = false;
      cardIndex = 0;
      activateCard(cardIndex);
    } else {
      if (cardIndex < cards.length - 1) {
        activateCard(cardIndex + 1);
      } else {
        resetToHello();
      }
    }
  }

  function activateCard(index) {
    cards.forEach((card, i) => {
      card.classList.remove("active", "hidden");
      card.style.pointerEvents = "none";
      if (i < index) card.classList.add("hidden");
    });
    const targetCard = cards[index];
    setTimeout(() => {
      targetCard.classList.add("active");
      cards[index].style.pointerEvents = "auto";
    }, 50);
    cardIndex = index;
  }

  function resetToHello() {
    cards.forEach(card => {
      card.classList.remove("active");
      card.classList.add("hidden");
    });

    introElement.style.opacity = 1;
    introElement.style.pointerEvents = "auto";
    isHelloState = true;
    typeText();
  }

  document.addEventListener("mousemove", function (e) {
    targetX = e.pageX;
    targetY = e.pageY;

    if (isInitialPosition) {
      isInitialPosition = false;
      setCursorCenterStyle(false);
    }
  });

  document.addEventListener("mouseover", function (e) {
    const target = e.target;

    if (target === introElement || target.closest(".card")) {
      cursorText.style.opacity = 1;
    } else {
      cursorText.style.opacity = 0;
    }
  });

  introElement.addEventListener("click", showNextCard);
  cards.forEach(card => {
    card.addEventListener("click", () => {
      if (card.classList.contains("active")) {
        showNextCard();
      }
    });
  });

  setCursorCenterStyle(true);
  typeText();
  updateCursorPosition();
});
