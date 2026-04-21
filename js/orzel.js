// Inicjalizacja hologramu
(function () {
  console.log("orzel.js loaded");

  // --- Funkcje hologramu ---
  function initHologram() {
    const holos = document.querySelectorAll(".holo-back");
    const bases = document.querySelectorAll(".base-back");
    const tops = document.querySelectorAll(".godlo-top");

    console.log(
      "initHologram: found",
      holos.length,
      "holo-back,", bases.length, "base-back,", tops.length, "godlo-top"
    );

    if (holos.length === 0) {
      console.warn("No .holo-back elements found!");
      return;
    }

    // Wymuszenie załadowania obrazów tła
    bases.forEach((base) => {
      base.style.display = "block";
      base.style.opacity = "1";
    });

    tops.forEach((top) => {
      top.style.display = "block";
      top.style.opacity = "1";
    });

    // Inicjalna widoczność hologramu w pozycji pionowej
    holos.forEach((holo) => {
      holo.style.opacity = "0.7";
      holo.style.backgroundPosition = "center 50%";
    });

    console.log("Hologram initialized successfully");
  }

  // Obsługa orientacji (poprawiona płynność)
  let ticking = false;
  function handleOrientation(e) {
    if (e.beta === null) return;
    
    // Używamy requestAnimationFrame dla płynności animacji
    if (!ticking) {
      requestAnimationFrame(() => {
        const beta = e.beta;
        const holos = document.querySelectorAll(".holo-back");

        // Zawsze pokazuj gradient - zmienia się intensywność i pozycja
        let t = Math.sin(((beta - 90) * Math.PI) / 180);
        t = Math.abs(t);
        t = Math.pow(t, 0.6); // Delikatniejsza krzywa dla lepszych wrażeń

        // Zwiększone minimum opacity dla zakresu 60-140
        let minOpacity = 0.3;
        if (beta >= 60 && beta <= 140) {
          minOpacity = 0.65; // mocniejsze kolory w pozycji pionowej
        }
        const opacity = Math.max(minOpacity, t);

        // Pozycja przesunięcia w zależności od kąta (zakres 0-100%)
        const pos = 100 * t;

        // Zastosuj do wszystkich hologramów na stronie
        holos.forEach((holo) => {
          holo.style.backgroundPosition = `center ${pos}%`;
          holo.style.opacity = opacity;
        });
        
        ticking = false;
      });
      ticking = true;
    }
  }

  // --- Funkcje zgody na czujniki (iOS) ---
  let isOrientationEnabled = false;
  
  async function requestOrientationPermission() {
    // Sprawdź czy to iOS (webkit)
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const permissionState = await DeviceOrientationEvent.requestPermission();
        if (permissionState === 'granted') {
          console.log("[Orzel] Orientation permission granted for iOS");
          enableMotionSensor();
          return true;
        } else {
          console.warn("[Orzel] Orientation permission denied");
          return false;
        }
      } catch (err) {
        console.error("[Orzel] Error requesting permission:", err);
        return false;
      }
    } else {
      // Android lub desktop - od razu włączamy
      console.log("[Orzel] Non-iOS device, enabling directly");
      enableMotionSensor();
      return true;
    }
  }

  function enableMotionSensor() {
    if (isOrientationEnabled) return;
    console.log("[Orzel] Enabling device orientation listener");
    window.addEventListener("deviceorientation", handleOrientation);
    isOrientationEnabled = true;
    
    // Ukryj/usuń przycisk zgody jeśli istnieje
    const btn = document.getElementById('enable-sensors-btn');
    if (btn && btn.parentNode) {
      btn.style.display = 'none';
    }
  }

  // --- Inicjalizacja ---
  // Uruchom podstawowe ustawienia wizualne od razu
  initHologram();
  
  // Obsługa pageshow dla nawigacji z cache
  window.addEventListener("pageshow", function (event) {
    console.log("pageshow event fired, persisted:", event.persisted);
    initHologram();
  });

  // Sprawdź czy potrzebujemy zgody (iOS)
  // Uruchom po kliknięciu w dowolne miejsce na stronie (zgodnie z wymogami iOS)
  function bindPermissionRequest() {
    // Jeśli to iOS, czekamy na pierwsze kliknięcie użytkownika
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      console.log("[Orzel] iOS detected - waiting for user interaction");
      
      // Obsługa kliknięcia w konkretny przycisk (Pozostałe skróty)
      const moreBtn = document.querySelector('.quick-actions img[src$="ab011_more_vertical.svg"]')?.closest('.qa-item');
      if (moreBtn) {
        moreBtn.addEventListener('click', requestOrientationPermission, { once: true });
      }
      
      // Dodajemy również nasłuch na całe body jako fallback
      document.body.addEventListener('click', function tempHandler() {
        requestOrientationPermission();
        document.body.removeEventListener('click', tempHandler);
      }, { once: true });
    } else {
      // Android - włączamy od razu
      enableMotionSensor();
    }
  }

  // Opóźnij podpinanie, aby DOM był w pełni gotowy
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindPermissionRequest);
  } else {
    bindPermissionRequest();
  }
})();