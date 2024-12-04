document.addEventListener("DOMContentLoaded", function () {
  document.body.classList.add("fade-in");

  const links = document.querySelectorAll("a:not(#insta a)");

  links.forEach(link => {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      document.body.classList.remove("fade-in");
      document.body.classList.add("fade-out");

      setTimeout(() => {
        window.location.href = link.href;
      }, 500);
    });
  });
});