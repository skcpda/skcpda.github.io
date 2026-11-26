(() => {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav-links");
  const year = document.getElementById("year");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (year) year.textContent = String(new Date().getFullYear());

  const onScroll = () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 12);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  toggle?.addEventListener("click", () => {
    const open = nav?.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });

  nav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      toggle?.setAttribute("aria-expanded", "false");
    });
  });

  const audio = document.getElementById("grove-audio");
  const sound = document.querySelector(".sound-toggle");
  if (audio && sound) {
    audio.volume = 0.55;
    let userPaused = false;
    const label = sound.querySelector(".sound-label");
    const setState = (on) => {
      sound.setAttribute("aria-pressed", on ? "true" : "false");
      sound.setAttribute("aria-label", on ? "Pause the flute" : "Play the flute");
      if (label) label.textContent = on ? "Playing" : "Listen";
    };
    const start = () => {
      if (userPaused || !audio.paused) return;
      audio.play().then(() => setState(true)).catch(() => setState(false));
    };
    sound.addEventListener("click", () => {
      if (audio.paused) {
        userPaused = false;
        start();
      } else {
        userPaused = true;
        audio.pause();
        setState(false);
      }
    });
    start();
    document.addEventListener("pointerdown", start);
  }

  document.querySelectorAll(".abstract-toggle").forEach((button) => {
    button.addEventListener("click", () => {
      const folio = button.closest(".folio");
      const open = folio?.classList.toggle("is-open");
      const panel = document.getElementById(button.getAttribute("aria-controls"));
      button.setAttribute("aria-expanded", open ? "true" : "false");
      button.textContent = open ? "Hide abstract" : "Read abstract";
      panel?.setAttribute("aria-hidden", open ? "false" : "true");
    });
  });

  if (!reduce && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
  } else {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-in"));
  }

  const canvas = document.getElementById("grove-dust");
  if (canvas && canvas.getContext && !reduce) {
    const ctx = canvas.getContext("2d");
    const dots = Array.from({ length: 46 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.5 + 0.35,
      s: Math.random() * 0.00032 + 0.0001,
      p: Math.random() * Math.PI * 2,
    }));

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
    };
    size();
    window.addEventListener("resize", size, { passive: true });

    const tick = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      for (const d of dots) {
        d.y -= d.s;
        d.x += Math.sin(d.y * 28 + d.p) * 0.00018;
        if (d.y < -0.03) {
          d.y = 1.03;
          d.x = Math.random();
        }
        const glow = 0.12 + 0.42 * Math.abs(Math.sin(d.p + d.y * 10));
        ctx.beginPath();
        ctx.fillStyle = `rgba(232, 197, 71, ${glow})`;
        ctx.arc(d.x * w, d.y * h, d.r * (w / window.innerWidth), 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(tick);
    };
    tick();
  }

  const lights = document.getElementById("cover-lights");
  if (lights && lights.getContext && !reduce) {
    const lctx = lights.getContext("2d");
    const motes = Array.from({ length: 34 }, () => ({
      x: Math.random() * 0.62,
      y: Math.random(),
      r: Math.random() * 2.2 + 1.1,
      s: Math.random() * 0.00018 + 0.00005,
      p: Math.random() * Math.PI * 2,
      tw: Math.random() * 0.0016 + 0.0007,
    }));

    const sizeLights = () => {
      const rect = lights.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      lights.width = Math.floor(rect.width * dpr);
      lights.height = Math.floor(rect.height * dpr);
    };
    sizeLights();
    window.addEventListener("resize", sizeLights, { passive: true });

    const drawLights = (t) => {
      const w = lights.width;
      const h = lights.height;
      lctx.clearRect(0, 0, w, h);
      for (const m of motes) {
        m.y -= m.s;
        m.x += Math.sin(t * 0.00035 + m.p) * 0.00012;
        if (m.y < -0.05) {
          m.y = 1.05;
          m.x = Math.random() * 0.58;
        }
        const pulse = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(t * m.tw + m.p));
        const x = m.x * w;
        const y = m.y * h;
        const rad = m.r * 8 * (w / Math.max(lights.clientWidth, 1));
        const g = lctx.createRadialGradient(x, y, 0, x, y, rad);
        g.addColorStop(0, `rgba(255, 244, 214, ${0.9 * pulse})`);
        g.addColorStop(0.22, `rgba(255, 196, 90, ${0.32 * pulse})`);
        g.addColorStop(1, "rgba(255, 196, 90, 0)");
        lctx.fillStyle = g;
        lctx.beginPath();
        lctx.arc(x, y, rad, 0, Math.PI * 2);
        lctx.fill();
      }
      requestAnimationFrame(drawLights);
    };
    requestAnimationFrame(drawLights);
  }
})();
