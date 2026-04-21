// Inicjalizacja hologramu z pełną obsługą czujników
(function () {
  console.log("orzel.js loaded - starting hologram initialization");

  let isOrientationEnabled = false;
  let currentOpacity = 0.7;
  let currentPosition = 50;

  // Funkcje hologramu
  function initHologram() {
    const holos = document.querySelectorAll(".holo-back");
    const bases = document.querySelectorAll(".base-back");
    const tops = document.querySelectorAll(".godlo-top");

    console.log("initHologram: found", holos.length, "holo-back");

    if (holos.length === 0) {
      console.warn("No .holo-back elements found!");
      return;
    }

    bases.forEach((base) => {
      base.style.display = "block";
      base.style.opacity = "1";
    });

    tops.forEach((top) => {
      top.style.display = "block";
      top.style.opacity = "1";
    });

    holos.forEach((holo) => {
      holo.style.opacity = "0.7";
      holo.style.backgroundPosition = "center 50%";
      holo.style.transition = "opacity 0.05s ease, background-position 0.05s ease";
    });

    console.log("Hologram initialized successfully");
  }

  // Obsługa orientacji - płynna animacja
  let ticking = false;
  let lastBeta = 90;
  
  function handleOrientation(e) {
    if (e.beta === null) {
      console.warn("No beta value in orientation event");
      return;
    }

    const beta = e.beta;
    lastBeta = beta;
    
    if (!ticking) {
      requestAnimationFrame(() => {
        const holos = document.querySelectorAll(".holo-back");
        
        if (holos.length === 0) return;
        
        // Obliczanie intensywności na podstawie kąta nachylenia
        // beta = 90 to telefon pionowo (normalna pozycja)
        // Odchylenie w przód/tył zmienia kąt
        let intensity = Math.sin(((beta - 90) * Math.PI) / 180);
        intensity = Math.abs(intensity);
        intensity = Math.pow(intensity, 0.5); // bardziej czuły
        
        // Opacity w zależności od kąta
        let opacity;
        if (beta >= 70 && beta <= 110) {
          // Pionowa pozycja - mocniejszy hologram
          opacity = 0.5 + intensity * 0.4;
        } else {
          // Odchylony - słabszy
          opacity = 0.2 + intensity * 0.3;
        }
        opacity = Math.min(0.9, Math.max(0.15, opacity));
        
        // Pozycja przesunięcia gradientu (0-100%)
        const position = 30 + intensity * 60;
        
        currentOpacity = opacity;
        currentPosition = position;
        
        holos.forEach((holo) => {
          holo.style.opacity = opacity;
          holo.style.backgroundPosition = `center ${position}%`;
        });
        
        ticking = false;
      });
      ticking = true;
    }
  }

  // Funkcja do testowania hologramu (symulacja)
  function testHologram() {
    console.log("Testing hologram - simulating movement");
    let testPos = 0;
    let testDir = 1;
    const holos = document.querySelectorAll(".holo-back");
    
    const interval = setInterval(() => {
      testPos += testDir * 5;
      if (testPos >= 80) testDir = -1;
      if (testPos <= 20) testDir = 1;
      
      const opacity = 0.3 + (testPos / 100) * 0.5;
      
      holos.forEach((holo) => {
        holo.style.opacity = opacity;
        holo.style.backgroundPosition = `center ${testPos}%`;
      });
      
      console.log("Test position:", testPos, "opacity:", opacity);
    }, 50);
    
    setTimeout(() => clearInterval(interval), 5000);
  }

  // Prośba o zgodę na czujniki (iOS)
  async function requestOrientationPermission() {
    console.log("Requesting orientation permission...");
    
    // iOS 13+ wymaga wyraźnej zgody
    if (typeof DeviceOrientationEvent !== 'undefined' && 
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const permissionState = await DeviceOrientationEvent.requestPermission();
        if (permissionState === 'granted') {
          console.log("✅ Orientation permission granted for iOS");
          enableMotionSensor();
          return true;
        } else {
          console.warn("❌ Orientation permission denied");
          return false;
        }
      } catch (err) {
        console.error("Error requesting permission:", err);
        return false;
      }
    } else {
      // Android lub inne - od razu włączamy
      console.log("Non-iOS device, enabling directly");
      enableMotionSensor();
      return true;
    }
  }

  function enableMotionSensor() {
    if (isOrientationEnabled) {
      console.log("Motion sensor already enabled");
      return;
    }
    
    console.log("🔧 Enabling device orientation listener");
    window.addEventListener("deviceorientation", handleOrientation);
    isOrientationEnabled = true;
    
    // Ukryj przycisk aktywacji jeśli istnieje
    const btn = document.getElementById('enable-sensors-btn');
    if (btn) btn.style.display = 'none';
    
    // Pokazujemy że działa
    const holos = document.querySelectorAll(".holo-back");
    holos.forEach((holo) => {
      holo.style.transition = "opacity 0.1s ease, background-position 0.1s ease";
    });
  }

  // Sprawdzenie czy czujniki już działają
  function checkIfSensorsWorking() {
    // Ustawiamy timeout - jeśli po 2 sekundach nie ma danych, prosimy o kliknięcie
    let hasData = false;
    
    const testListener = (e) => {
      if (e.beta !== null && e.beta !== undefined) {
        hasData = true;
        console.log("✅ Sensors are working! Beta:", e.beta);
        window.removeEventListener("deviceorientation", testListener);
      }
    };
    
    window.addEventListener("deviceorientation", testListener);
    
    setTimeout(() => {
      if (!hasData && !isOrientationEnabled) {
        console.log("⚠️ No sensor data received - need user interaction for iOS");
        showActivationButton();
      }
      window.removeEventListener("deviceorientation", testListener);
    }, 1000);
  }
  
  function showActivationButton() {
    // Sprawdzamy czy już istnieje
    if (document.getElementById('enable-sensors-btn')) return;
    
    // Tworzymy przycisk aktywacji
    const btn = document.createElement('button');
    btn.id = 'enable-sensors-btn';
    btn.innerHTML = '🎯 Aktywuj efekt 3D (pochyl telefon)';
    btn.style.cssText = `
      position: fixed;
      bottom: 100px;
      left: 20px;
      right: 20px;
      z-index: 10000;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 50px;
      padding: 14px 20px;
      font-size: 16px;
      font-weight: bold;
      text-align: center;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
      animation: pulse 1.5s infinite;
    `;
    
    // Dodajemy animację pulse
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.02); opacity: 0.9; }
        100% { transform: scale(1); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    
    btn.onclick = async () => {
      btn.innerHTML = '⏳ Proszę czekać...';
      btn.style.opacity = '0.7';
      await requestOrientationPermission();
      btn.remove();
    };
    
    document.body.appendChild(btn);
    console.log("Activation button shown");
  }

  // Inicjalizacja
  initHologram();
  
  // Uruchom po załadowaniu DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      checkIfSensorsWorking();
    });
  } else {
    checkIfSensorsWorking();
  }
  
  // Ponowna inicjalizacja przy pageshow (cache)
  window.addEventListener("pageshow", (event) => {
    console.log("pageshow event, persisted:", event.persisted);
    initHologram();
  });
  
  // Dla debugowania - dodajemy do window
  window.testHologram = testHologram;
  window.enableMotionSensor = enableMotionSensor;
  
  console.log("orzel.js fully loaded - call window.testHologram() to test");
})();