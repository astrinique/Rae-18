const birthdayGate = {
  testMode: false,
  testDurationMs: 10000,
  target: new Date("2026-07-18T00:00:00+01:00"),
  storageKey: "raeBirthdayGateComplete",
};

let birthdayAudioUnlocked = false;

const optionalMedia = [
  {
    type: "video",
    sources: ["assets/IMG_9560.MP4", "assets/IMG_9560.mp4"],
    caption: "Promise to keep making you smile.",
  },
  {
    type: "video",
    sources: ["assets/IMG_9558.MP4", "assets/IMG_9558.mp4"],
    caption: "Friend, playmate, gossip mate, and man you trust.",
  },
  {
    type: "image",
    sources: ["assets/IMG_9569.JPG", "assets/IMG_9569.jpg"],
    caption: "This two together.",
  },
  {
    type: "image",
    sources: ["assets/IMG_9570.JPG", "assets/IMG_9570.jpg"],
    caption: "This two together.",
  },
  {
    type: "image",
    sources: ["assets/IMG_9547.JPG", "assets/IMG_9547.jpg"],
    caption: "I love you for life.",
  },
  {
    type: "image",
    sources: ["assets/IMG_9571.JPG", "assets/IMG_9571.jpg"],
    caption: "I love you for life.",
  },
  {
    type: "image",
    sources: ["assets/IMG_9541.PNG", "assets/IMG_9541.png"],
    caption: "Gallery, Snapchat, and TikTok drafts with your beauty.",
  },
];

window.addEventListener("DOMContentLoaded", () => {
  splitHeadlines();
  initSurprise();
  initTiltCards();
  loadOptionalMedia();

  initBirthdayGate().then(initMotion);
});

function initBirthdayGate() {
  const gate = document.querySelector("[data-birthday-gate]");
  const button = document.querySelector("[data-gate-button]");
  const note = document.querySelector("[data-gate-note]");
  if (!gate || !button) {
    document.body.classList.remove("gate-active");
    return Promise.resolve();
  }

  const completedBefore = sessionStorage.getItem(birthdayGate.storageKey) === "true";
  if (completedBefore) {
    sessionStorage.setItem(birthdayGate.storageKey, "true");
    document.body.classList.remove("gate-active");
    gate.remove();
    return Promise.resolve();
  }

  document.body.classList.add("gate-active");

  return new Promise((resolve) => {
    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;
      button.removeEventListener("click", handleUnlock);
      button.disabled = true;

      sessionStorage.setItem(birthdayGate.storageKey, "true");
      gate.classList.add("is-leaving");
      document.body.classList.remove("gate-active");

      window.setTimeout(() => {
        gate.remove();
        resolve();
      }, 880);
    };

    const handleUnlock = () => {
      if (finished) return;

      if (note) {
        note.textContent = "Sound approved. Welcome in.";
      }

      button.textContent = "Entering...";
      primeBirthdayAudio()
        .then(() => playBirthdaySound().catch(() => {}))
        .catch(() => {})
        .finally(() => {
          window.setTimeout(finish, 220);
        });
    };

    button.addEventListener("click", handleUnlock);
  });
}

function initBirthdayIntro() {
  const intro = document.querySelector("[data-birthday-intro]");
  const canvas = document.querySelector("[data-fireworks-canvas]");
  const status = document.querySelector("[data-sound-status]");
  if (!intro || !canvas) return Promise.resolve();

  intro.hidden = false;
  document.body.classList.add("intro-active");

  const fireworks = createFireworks(canvas);
  let soundStarted = false;

  const startSound = () => {
    if (soundStarted) return;

    playBirthdaySound()
      .then(() => {
        soundStarted = true;
        if (status) status.textContent = "Celebrating Rachel...";
      })
      .catch(() => {
        soundStarted = false;
        if (status) status.textContent = "Tap anywhere to play the birthday sound.";
      });
  };

  intro.addEventListener("pointerdown", startSound);
  intro.addEventListener("click", startSound);
  startSound();

  return new Promise((resolve) => {
    window.setTimeout(() => {
      intro.classList.add("is-leaving");
      document.body.classList.remove("intro-active");
      fireworks.stop();
      stopBirthdaySound();

      window.setTimeout(() => {
        intro.remove();
        resolve();
      }, 950);
    }, 7500);
  });
}

function createFireworks(canvas) {
  const context = canvas.getContext("2d");
  const particles = [];
  let animationFrame = 0;
  let lastBurst = 0;
  let running = true;
  const palette = ["#70a7ff", "#ffffff", "#2e6bff", "#dceeff"];

  const resize = () => {
    canvas.width = Math.floor(window.innerWidth * window.devicePixelRatio);
    canvas.height = Math.floor(window.innerHeight * window.devicePixelRatio);
    context.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
  };

  const burst = () => {
    const x = window.innerWidth * (0.15 + Math.random() * 0.7);
    const y = window.innerHeight * (0.16 + Math.random() * 0.42);
    const count = 42 + Math.floor(Math.random() * 34);
    const color = palette[Math.floor(Math.random() * palette.length)];

    for (let i = 0; i < count; i += 1) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = 1.2 + Math.random() * 4.2;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 1.5 + Math.random() * 2.8,
        life: 1,
        decay: 0.012 + Math.random() * 0.014,
        color,
      });
    }
  };

  const render = (time) => {
    if (!running) return;

    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    context.globalCompositeOperation = "lighter";

    if (time - lastBurst > 460) {
      burst();
      lastBurst = time;
    }

    for (let i = particles.length - 1; i >= 0; i -= 1) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.035;
      p.vx *= 0.992;
      p.vy *= 0.992;
      p.life -= p.decay;

      context.globalAlpha = Math.max(p.life, 0);
      context.fillStyle = p.color;
      context.beginPath();
      context.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      context.fill();

      if (p.life <= 0) {
        particles.splice(i, 1);
      }
    }

    context.globalAlpha = 1;
    animationFrame = requestAnimationFrame(render);
  };

  resize();
  burst();
  burst();
  window.addEventListener("resize", resize);
  animationFrame = requestAnimationFrame(render);

  return {
    stop() {
      running = false;
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
    },
  };
}

function getBirthdayAudio() {
  const audio = document.querySelector("[data-birthday-audio]");
  if (!audio) return null;

  audio.volume = 1;
  audio.muted = false;
  return audio;
}

function primeBirthdayAudio() {
  const audio = getBirthdayAudio();
  if (!audio || birthdayAudioUnlocked) return Promise.resolve();

  const originalVolume = audio.volume;
  audio.volume = 0.04;

  return audio
    .play()
    .then(() => {
      audio.pause();
      try {
        audio.currentTime = 0;
      } catch (error) {
        // Some mobile browsers delay seeking until metadata is ready.
      }
      audio.volume = originalVolume;
      birthdayAudioUnlocked = true;
    })
    .catch((error) => {
      audio.volume = originalVolume;
      throw error;
    });
}

function playBirthdaySound() {
  const audio = getBirthdayAudio();
  if (!audio) {
    return Promise.reject(new Error("Birthday audio unavailable"));
  }

  audio.pause();
  try {
    audio.currentTime = 0;
  } catch (error) {
    // Some mobile browsers delay seeking until metadata is ready.
  }
  audio.volume = 1;
  audio.muted = false;
  return audio.play();
}

function stopBirthdaySound() {
  const audio = getBirthdayAudio();
  if (!audio) return;

  audio.pause();
  try {
    audio.currentTime = 0;
  } catch (error) {
    // Some mobile browsers delay seeking until metadata is ready.
  }
}

function splitHeadlines() {
  document.querySelectorAll("[data-split]").forEach((element) => {
    const words = element.textContent.trim().split(/\s+/);
    element.textContent = "";
    words.forEach((word, index) => {
      const span = document.createElement("span");
      span.className = "word";
      span.textContent = word;
      element.appendChild(span);
      if (index < words.length - 1) {
        element.append(" ");
      }
    });
  });
}

function initSurprise() {
  const button = document.querySelector("[data-surprise-button]");
  const message = document.querySelector("[data-surprise-message]");
  if (!button || !message) return;

  button.addEventListener("click", () => {
    const isHidden = message.hasAttribute("hidden");
    if (isHidden) {
      message.removeAttribute("hidden");
      button.textContent = "Message revealed";
      if (window.gsap) {
        gsap.fromTo(
          message,
          { autoAlpha: 0, y: 24, scale: 0.98 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, ease: "power3.out" }
        );
      }
    }
  });
}

function initTiltCards() {
  const cards = document.querySelectorAll(".gallery-card, .media-card, .orbit-card");
  cards.forEach(applyTilt);
}

function applyTilt(card) {
  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    card.style.setProperty("--tilt-y", `${x * 8}deg`);
    card.style.setProperty("--tilt-x", `${y * -8}deg`);
    card.style.setProperty("--ry", `${x * 8}deg`);
    card.style.setProperty("--rx", `${y * -8}deg`);
  });

  card.addEventListener("pointerleave", () => {
    card.style.setProperty("--tilt-y", "0deg");
    card.style.setProperty("--tilt-x", "0deg");
    card.style.setProperty("--ry", "0deg");
    card.style.setProperty("--rx", "0deg");
  });
}

function loadOptionalMedia() {
  const section = document.querySelector("[data-optional-section]");
  const grid = document.querySelector("[data-optional-grid]");
  if (!section || !grid) return;

  let addedCount = 0;

  optionalMedia.forEach((item) => {
    resolveSource(item).then((source) => {
      if (!source) return;

      const card = document.createElement("figure");
      card.className = "media-card";

      if (item.type === "video") {
        const video = document.createElement("video");
        video.src = source;
        video.controls = true;
        video.muted = true;
        video.playsInline = true;
        video.preload = "metadata";
        card.appendChild(video);
      } else {
        const image = document.createElement("img");
        image.src = source;
        image.alt = item.caption;
        card.appendChild(image);
      }

      const caption = document.createElement("figcaption");
      caption.textContent = item.caption;
      card.appendChild(caption);
      grid.appendChild(card);
      section.hidden = false;
      section.querySelectorAll("[data-animate]").forEach((element) => element.classList.add("is-visible"));
      applyTilt(card);
      addedCount += 1;

      if (addedCount === 1 && window.gsap && window.ScrollTrigger) {
        gsap.fromTo(
          section,
          { autoAlpha: 0, y: 60 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: { trigger: section, start: "top 78%" },
          }
        );
      }
    });
  });
}

function resolveSource(item) {
  const tests = item.sources.map((source) => {
    if (item.type === "video") {
      return testVideo(source);
    }
    return testImage(source);
  });

  return tests.reduce(
    (chain, test) => chain.then((found) => (found ? found : test)),
    Promise.resolve("")
  );
}

function testImage(source) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(source);
    image.onerror = () => resolve("");
    image.src = source;
  });
}

function testVideo(source) {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => resolve(source);
    video.onerror = () => resolve("");
    video.src = source;
  });
}

function initMotion() {
  const animated = document.querySelectorAll("[data-animate]");

  if (window.gsap) {
    const hasScrollTrigger = Boolean(window.ScrollTrigger);
    if (hasScrollTrigger) {
      gsap.registerPlugin(window.ScrollTrigger);
    }

    gsap.to(".word", {
      opacity: 1,
      y: 0,
      rotateX: 0,
      duration: 0.9,
      stagger: 0.045,
      ease: "power3.out",
    });

    animated.forEach((item) => {
      const config = {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out",
      };

      if (hasScrollTrigger) {
        config.scrollTrigger = {
          trigger: item,
          start: "top 84%",
        };
      } else {
        config.delay = 0.18;
      }

      gsap.to(item, config);
    });

    gsap.fromTo(
      ".orbit-card-main",
      { y: 24, rotateZ: 2 },
      { y: -18, rotateZ: -1, repeat: -1, yoyo: true, duration: 4.6, ease: "sine.inOut" }
    );
    gsap.fromTo(
      ".orbit-card-left",
      { y: -10, rotateZ: -8 },
      { y: 18, rotateZ: -3, repeat: -1, yoyo: true, duration: 5.2, ease: "sine.inOut" }
    );
    gsap.fromTo(
      ".orbit-card-right",
      { y: 18, rotateZ: 7 },
      { y: -12, rotateZ: 3, repeat: -1, yoyo: true, duration: 4.9, ease: "sine.inOut" }
    );

    if (hasScrollTrigger) {
      gsap.timeline({
        scrollTrigger: {
          trigger: ".camera-path",
          start: "top top",
          end: "bottom bottom",
          scrub: 1.2,
        },
      })
        .to(".scene-copy", { xPercent: -8, autoAlpha: 0.82 }, 0)
        .fromTo(".story-card:nth-child(1)", { x: 90, rotateY: -18, autoAlpha: 0.2 }, { x: 0, rotateY: 0, autoAlpha: 1 }, 0)
        .fromTo(".story-card:nth-child(2)", { x: 130, rotateY: -20, autoAlpha: 0.2 }, { x: 0, rotateY: 0, autoAlpha: 1 }, 0.28)
        .fromTo(".story-card:nth-child(3)", { x: 170, rotateY: -22, autoAlpha: 0.2 }, { x: 0, rotateY: 0, autoAlpha: 1 }, 0.56);

      gsap.utils.toArray(".gallery-card").forEach((card, index) => {
        gsap.fromTo(
          card,
          { y: 90, autoAlpha: 0, rotateZ: index % 2 ? 2 : -2 },
          {
            y: 0,
            autoAlpha: 1,
            rotateZ: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 86%",
            },
          }
        );
      });
    }
  } else if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14 }
    );

    animated.forEach((item) => observer.observe(item));
    document.querySelectorAll(".word").forEach((word) => {
      word.style.opacity = "1";
      word.style.transform = "none";
    });
  } else {
    animated.forEach((item) => item.classList.add("is-visible"));
    document.querySelectorAll(".word").forEach((word) => {
      word.style.opacity = "1";
      word.style.transform = "none";
    });
  }
}
