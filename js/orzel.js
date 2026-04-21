// Prosta animacja hologramu - działa od razu, bez czujników
(function () {
  console.log("orzel.js loaded - SIMPLE AUTO ANIMATION");

  function initHologram() {
    const holos = document.querySelectorAll(".holo-back");
    const bases = document.querySelectorAll(".base-back");
    const tops = document.querySelectorAll(".godlo-top");

    console.log("Found:", holos.length, "holo-back");

    if (holos.length === 0) {
      console.warn("No .holo-back elements found!");
      return;
    }

    // Pokaż wszystkie warstwy
    bases.forEach(base => {
      base.style.display = "block";
      base.style.opacity = "1";
    });

    tops.forEach(top => {
      top.style.display = "block";
      top.style.opacity = "1";
    });

    // Ustaw początkową widoczność hologramu
    holos.forEach(holo => {
      holo.style.opacity = "0.7";
      holo.style.backgroundPosition = "center 50%";
    });

    console.log("Hologram initialized - ready for animation");
  }

  initHologram();

  // AUTOMATYCZNA ANIMACJA - fala przechodzi w górę i w dół
  let position = 0;
  let direction = 1;
  
  function animate() {
    const holos = document.querySelectorAll(".holo-back");
    if (holos.length === 0) return;
    
    // Przesuwanie pozycji (0% do 100%)
    position += direction * 1.5;
    
    if (position >= 100) {
      position = 100;
      direction = -1;
    } else if (position <= 0) {
      position = 0;
      direction = 1;
    }
    
    // Intensywność zmienia się wraz z ruchem
    let opacity = 0.5 + (Math.sin(position * Math.PI / 100) * 0.4);
    opacity = Math.min(0.9, Math.max(0.4, opacity));
    
    holos.forEach(holo => {
      holo.style.backgroundPosition = `center ${position}%`;
      holo.style.opacity = opacity;
    });
    
    requestAnimationFrame(animate);
  }
  
  // Uruchom animację
  animate();
  
  console.log("Auto animation started - hologram moves up and down");
})();