const stage = document.querySelector(".stage"),
  canvas = document.querySelector("#reveal"),
  ctx = canvas.getContext("2d"),
  portrait = new Image(),
  silhouette = new Image();
portrait.src = "assets/images/Me1-cutout.png";
silhouette.src = "assets/images/S3-cutout.png";
let ready = 0,
  x = 0,
  y = 0,
  active = false,
  radius = 135,
  targetRadius = 135;
function loaded() {
  ready++;
  if (ready === 2) {
    resize();
    draw();
  }
}
portrait.onload = loaded;
silhouette.onload = loaded;
function resize() {
  const d = devicePixelRatio || 1;
  canvas.width = innerWidth * d;
  canvas.height = innerHeight * d;
  canvas.style.width = innerWidth + "px";
  canvas.style.height = innerHeight + "px";
  ctx.setTransform(d, 0, 0, d, 0, 0);
}
addEventListener("resize", resize);
function draw() {
  if (!ready) return;
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  if (active) {
    const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
    grad.addColorStop(0, "rgba(0,0,0,1)");
    grad.addColorStop(0.52, "rgba(0,0,0,.82)");
    grad.addColorStop(0.82, "rgba(0,0,0,.28)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    const reveal = document.createElement("canvas");
    reveal.width = innerWidth;
    reveal.height = innerHeight;
    const r = reveal.getContext("2d");
    const portraitHeight = innerHeight * 1.15;
    const portraitWidth = portrait.width * (portraitHeight / portrait.height);
    const portraitX = (innerWidth - portraitWidth) / 2;
    r.drawImage(
      portrait,
      portraitX,
      -innerHeight * 0.04,
      portraitWidth,
      portraitHeight,
    );
    r.globalCompositeOperation = "destination-in";
    r.fillStyle = grad;
    r.fillRect(0, 0, innerWidth, innerHeight);
    r.globalCompositeOperation = "destination-in";
    r.drawImage(silhouette, 0, 0, innerWidth, innerHeight);
    ctx.drawImage(reveal, 0, 0);
  }
  requestAnimationFrame(draw);
}
stage.addEventListener("pointermove", (e) => {
  const rect = stage.getBoundingClientRect();
  x = e.clientX - rect.left;
  y = e.clientY - rect.top;
  active = true;
  gsap.to(
    { v: radius },
    {
      v: targetRadius,
      duration: 0.35,
      ease: "power2.out",
      onUpdate: function () {
        radius = this.targets()[0].v;
      },
    },
  );
});
stage.addEventListener("pointerleave", () => {
  active = false;
});
const resumeSections = document.querySelectorAll(".resume-section");
const revealObserver = new IntersectionObserver(
  (entries) =>
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        gsap.from(entry.target.querySelectorAll(".skill"), {
          y: 24,
          opacity: 0,
          duration: 0.65,
          stagger: 0.08,
          ease: "power3.out",
        });
        revealObserver.unobserve(entry.target);
      }
    }),
  { threshold: 0.14 },
);
resumeSections.forEach((section) => revealObserver.observe(section));
const sectionFocusObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        resumeSections.forEach((section) =>
          section.classList.remove("is-current"),
        );
        entry.target.classList.add("is-current");
      }
    });
  },
  { rootMargin: "-25% 0px -45% 0px", threshold: 0 },
);
resumeSections.forEach((section) => sectionFocusObserver.observe(section));
const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const scrollTitles = [...document.querySelectorAll(".resume-head h2")];
scrollTitles.forEach((title) => {
  const text = title.textContent || "";
  title.setAttribute("aria-label", text);
  title.textContent = "";
  [...text].forEach((char) => {
    const letter = document.createElement("span");
    letter.className = "scroll-letter";
    letter.textContent = char === " " ? String.fromCharCode(160) : char;
    letter.setAttribute("aria-hidden", "true");
    title.appendChild(letter);
  });
});
const scrollMotionSections = [...document.querySelectorAll(".resume-section")];
const heroStage = document.querySelector(".stage"),
  heroImage = heroStage?.querySelector(".spider"),
  heroCanvas = document.querySelector("#reveal"),
  heroName = document.querySelector(".hero-name");
let scrollMotionFrame = 0;
const updateScrollMotion = () => {
  scrollMotionFrame = 0;
  const viewportCenter = innerHeight * 0.5;
  if (heroStage) {
    const heroRect = heroStage.getBoundingClientRect();
    const heroProgress = clamp(
      -heroRect.top / Math.max(innerHeight, heroRect.height),
      0,
      1,
    );
    const parallaxY = heroProgress * 72;
    heroStage.style.setProperty(
      "--hero-parallax-y",
      `${parallaxY.toFixed(2)}px`,
    );
    heroStage.style.setProperty(
      "--hero-parallax-soft-y",
      `${(parallaxY * 0.42).toFixed(2)}px`,
    );
    heroImage?.style.setProperty(
      "--hero-image-y",
      `${(parallaxY * 0.16).toFixed(2)}px`,
    );
    heroCanvas?.style.setProperty(
      "--hero-canvas-y",
      `${(parallaxY * 0.1).toFixed(2)}px`,
    );
    heroName?.style.setProperty(
      "--hero-name-y",
      `${(parallaxY * 0.08).toFixed(2)}px`,
    );
  }
  scrollMotionSections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    const sectionCenter = rect.top + rect.height * 0.5;
    const focus = clamp(
      1 - Math.abs(sectionCenter - viewportCenter) / (innerHeight * 1.05),
    );
    const settle = focus * focus * (3 - 2 * focus);
    const strength = 1 - settle;
    section.style.setProperty("--scroll-focus", settle.toFixed(3));
    section
      .querySelectorAll(".scroll-letter")
      .forEach((letter, index, letters) => {
        const distance = index - (letters.length - 1) / 2;
        const x = distance * 5.5 * strength;
        const y = Math.abs(distance) * 1.8 * strength;
        const rotate = distance * 4.5 * strength;
        letter.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0) rotateX(${rotate.toFixed(2)}deg)`;
        letter.style.opacity = (0.48 + settle * 0.52).toFixed(3);
      });
    section
      .querySelectorAll(
        ".profile-grid,.education-grid,.experience-grid,.skills-grid,.contact-intro,.contact-form",
      )
      .forEach((node, index) => {
        const side = index % 2 === 0 ? -1 : 1;
        const x = side * 18 * strength;
        const y = 10 * strength;
        node.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0) scale(${(0.985 + settle * 0.015).toFixed(3)})`;
        node.style.opacity = (0.82 + settle * 0.18).toFixed(3);
        node.style.filter = `blur(${(strength * 0.85).toFixed(2)}px)`;
      });
  });
};
const requestScrollMotion = () => {
  if (!scrollMotionFrame)
    scrollMotionFrame = requestAnimationFrame(updateScrollMotion);
};
addEventListener("scroll", requestScrollMotion, { passive: true });
addEventListener("resize", requestScrollMotion);
requestScrollMotion();
const openingPage = document.querySelector(".opening-page"),
  transitionLayer = document.querySelector(".page-transition");
if ("scrollRestoration" in history) history.scrollRestoration = "manual";
const resetToOpening = () => {
  document.body.classList.remove("is-portfolio-active");
  openingPage?.classList.remove("is-exiting");
  transitionLayer?.classList.remove("is-active");
  window.scrollTo(0, 0);
};
window.addEventListener("pageshow", resetToOpening);
resetToOpening();
const indexLinks = document.querySelectorAll('a[href="#portfolio-index"]');
const showPortfolio = (event) => {
  event.preventDefault();
  document.body.classList.add("is-portfolio-active");
  openingPage?.classList.add("is-exiting");
  transitionLayer?.classList.add("is-active");
  window.setTimeout(() => {
    transitionLayer?.classList.remove("is-active");
  }, 1260);
};
indexLinks.forEach((link) => link.addEventListener("click", showPortfolio));
document.querySelectorAll('a[href="#top"]').forEach((link) =>
  link.addEventListener("click", (event) => {
    event.preventDefault();
    transitionLayer?.classList.add("is-active");
    window.setTimeout(() => {
      document.body.classList.remove("is-portfolio-active");
      openingPage?.classList.remove("is-exiting");
      window.scrollTo(0, 0);
      window.setTimeout(
        () => transitionLayer?.classList.remove("is-active"),
        180,
      );
    }, 1120);
  }),
);
const tabs = document.querySelectorAll(".hero-tabs a:not(.name)"),
  pulse = document.querySelector(".tab-pulse");
tabs.forEach((tab) =>
  tab.addEventListener("click", (event) => {
    event.preventDefault();
    tabs.forEach((item) => item.classList.remove("active"));
    tab.classList.add("active");
    const target = document.querySelector(tab.getAttribute("href"));
    transitionLayer?.classList.add("is-active", "is-section-transition");
    window.setTimeout(
      () => target?.scrollIntoView({ behavior: "smooth", block: "start" }),
      140,
    );
    window.setTimeout(
      () =>
        transitionLayer?.classList.remove("is-active", "is-section-transition"),
      760,
    );
    const box = tab.getBoundingClientRect();
    gsap.fromTo(
      pulse,
      {
        left: box.left + box.width / 2,
        top: box.top + box.height / 2,
        opacity: 0.9,
        scale: 0.2,
      },
      { opacity: 0, scale: 10, duration: 0.7, ease: "power3.out" },
    );
    gsap.fromTo(
      tab,
      { y: -2 },
      { y: 0, duration: 0.45, ease: "elastic.out(1,.45)" },
    );
  }),
);
const audio = document.querySelector("#ohYeah"),
  audioPlayer = document.querySelector(".audio-player"),
  audioToggle = document.querySelector("#audioToggle"),
  play = document.querySelector("#playAudio"),
  next = document.querySelector("#nextTrack"),
  shuffle = document.querySelector("#shuffleTrack"),
  loop = document.querySelector("#loopTrack"),
  trackName = document.querySelector("#trackName"),
  down = document.querySelector("#volumeDown"),
  up = document.querySelector("#volumeUp"),
  level = document.querySelector("#volumeLevel");
const tracks = [
  { name: "Oh yeah", src: "assets/media/oh-yeah.mp3" },
  { name: "Sunflower", src: "assets/audio/Sunflower.mp3" },
];
let trackIndex = 0,
  shuffleEnabled = false,
  loopEnabled = false;
audio.volume = 0.5;
const updateVolume = () =>
  (level.textContent = Math.round(audio.volume * 100) + "%");
const updateTrackLabel = () =>
  (trackName.textContent = tracks[trackIndex].name);
const updateModes = () => {
  audio.loop = loopEnabled;
  shuffle.classList.toggle("is-active", shuffleEnabled);
  loop.classList.toggle("is-active", loopEnabled);
  shuffle.setAttribute("aria-pressed", String(shuffleEnabled));
  loop.setAttribute("aria-pressed", String(loopEnabled));
  shuffle.setAttribute(
    "aria-label",
    shuffleEnabled ? "Disable shuffle" : "Enable shuffle",
  );
  loop.setAttribute("aria-label", loopEnabled ? "Disable loop" : "Enable loop");
};
const randomTrackIndex = () => {
  if (tracks.length < 2) return trackIndex;
  let nextIndex = trackIndex;
  while (nextIndex === trackIndex)
    nextIndex = Math.floor(Math.random() * tracks.length);
  return nextIndex;
};
const tryAutoplay = () =>
  audio
    .play()
    .then(() => {
      play.textContent = "Ⅱ";
    })
    .catch(() => {});
const unlockAutoplay = (event) => {
  if (event.target instanceof Element && event.target.closest("#playAudio"))
    return;
  tryAutoplay();
};
const setTrack = (index, resume = !audio.paused) => {
  trackIndex = (index + tracks.length) % tracks.length;
  audio.pause();
  audio.src = tracks[trackIndex].src;
  audio.load();
  updateTrackLabel();
  if (resume) {
    audio
      .play()
      .then(() => {
        play.textContent = "Ⅱ";
      })
      .catch(() => {
        play.textContent = "▶";
      });
  } else play.textContent = "▶";
};
const advanceTrack = (resume = true) =>
  setTrack(shuffleEnabled ? randomTrackIndex() : trackIndex + 1, resume);
tryAutoplay();
audioToggle.addEventListener("click", () => {
  const open = audioPlayer.classList.toggle("is-open");
  audioToggle.setAttribute("aria-expanded", String(open));
  audioToggle.setAttribute(
    "aria-label",
    open ? "Close music controls" : "Open music controls",
  );
});
["pointerdown", "touchstart", "keydown"].forEach((type) =>
  window.addEventListener(type, unlockAutoplay, { once: true, passive: true }),
);
play.addEventListener("click", () => {
  if (audio.paused) {
    audio
      .play()
      .then(() => {
        play.textContent = "Ⅱ";
      })
      .catch(() => {});
  } else {
    audio.pause();
    play.textContent = "▶";
  }
});
next.addEventListener("click", () => advanceTrack(!audio.paused));
shuffle.addEventListener("click", () => {
  shuffleEnabled = !shuffleEnabled;
  if (shuffleEnabled) loopEnabled = false;
  updateModes();
});
loop.addEventListener("click", () => {
  loopEnabled = !loopEnabled;
  if (loopEnabled) shuffleEnabled = false;
  updateModes();
});
down.addEventListener("click", () => {
  audio.volume = Math.max(0, audio.volume - 0.1);
  updateVolume();
});
up.addEventListener("click", () => {
  audio.volume = Math.min(1, audio.volume + 0.1);
  updateVolume();
});
audio.addEventListener("ended", () => {
  if (!loopEnabled) advanceTrack(true);
});
updateTrackLabel();
updateModes();
updateVolume();

// Skills popup: each category reveals its application toolkit.
const skillModal = document.querySelector("#skillModal");
const modalTitle = document.querySelector("#skillModalTitle");
const modalDescription = document.querySelector("#skillModalDescription");
const toolList = document.querySelector("#toolList");
const skillData = {
  hardware: {
    title: "Hardware & Network",
    description:
      "Hands-on tools and systems used for infrastructure support, device maintenance, and network troubleshooting.",
    tools: [
      ["windows", "Windows", "Operating system"],
      ["cisco", "Cisco", "Router / switch"],
      ["cctv", "CCTV Systems", "CCTV systems"],
      ["dell", "Dell", "PC hardware"],
      ["tp-link", "TP-Link", "Network devices"],
    ],
  },
  admin: {
    title: "OS & Admin",
    description:
      "Operating systems and administration skills for keeping users, endpoints, and services running smoothly.",
    tools: [
      ["microsoft", "Windows 10 / 11", "Desktop administration"],
      ["windowsserver", "Windows Server", "Server administration"],
      ["microsoftactive", "Active Directory", "User and access basics"],
      ["cloud", "Cloud", "Backup and recovery"],
    ],
  },
  support: {
    title: "Support & Tools",
    description:
      "Everyday support applications for remote assistance, productivity, business systems, and service requests.",
    tools: [
      ["anydesk", "AnyDesk", "Remote support"],
      ["teamviewer", "TeamViewer", "Remote support"],
      ["microsoft365", "Microsoft 365", "Productivity suite"],
      ["microsoftteams", "Microsoft Teams", "Team collaboration"],
      ["erp", "ERP Systems", "Business workflow"],
      ["jira", "IT Ticketing", "Issue tracking"],
    ],
  },
  web: {
    title: "Database & Web",
    description:
      "Core technologies used to build, maintain, and connect internal web and database systems.",
    tools: [
      ["php", "PHP", "Backend development"],
      ["html5", "HTML5", "Web structure"],
      ["css", "CSS3", "Web styling"],
      ["mysql", "MySQL", "Relational database"],
      ["mariadb", "MariaDB", "Relational database"],
      ["bootstrap", "Bootstrap", "UI framework"],
    ],
  },
  media: {
    title: "Media & Content",
    description:
      "Creative applications used for editing videos, designing graphics, and preparing clear visual content.",
    tools: [
      ["capcut", "CapCut", "Video editing"],
      ["adobepremierepro", "Premiere Pro", "Video editing"],
      ["canva", "Canva", "Visual design"],
      ["adobephotoshop", "Photoshop", "Image editing"],
    ],
  },
};
const localIcons = {
  windows: "assets/images/skill-icons/windows.png",
  cctv: "assets/images/skill-icons/cctv.png",
  "tp-link": "assets/images/skill-icons/tp-link.png",
  microsoft: "assets/images/skill-icons/windows.png",
  windowsserver: "assets/images/skill-icons/windows-server.png",
  microsoftactive: "assets/images/skill-icons/active-directory.png",
  cloud: "assets/images/skill-icons/cloud.png",
  microsoft365: "assets/images/skill-icons/microsoft-365.png",
  microsoftteams: "assets/images/skill-icons/microsoft-teams.png",
  erp: "assets/images/skill-icons/erp.png",
  capcut: "assets/images/skill-icons/capcut.png",
  adobepremierepro: "assets/images/skill-icons/premiere-pro.png",
  canva: "assets/images/skill-icons/canva.png",
  adobephotoshop: "assets/images/skill-icons/photoshop.png",
};
const openSkillModal = (key) => {
  const data = skillData[key];
  if (!data) return;
  modalTitle.textContent = data.title;
  modalDescription.textContent = data.description;
  toolList.innerHTML = data.tools
    .map(([icon, name, type]) => {
      const src =
        localIcons[icon] || `https://cdn.simpleicons.org/${icon}/ffffff`;
      return `<div class="tool-item"><img src="${src}" alt="${name} logo" loading="lazy"><span><strong>${name}</strong><small>${type}</small></span></div>`;
    })
    .join("");
  skillModal.classList.add("is-open");
  skillModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  skillModal.querySelector(".skill-modal-close").focus();
};
const closeSkillModal = () => {
  skillModal.classList.remove("is-open");
  skillModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
};
document
  .querySelectorAll(".skill[data-skill]")
  .forEach((card) =>
    card.addEventListener("click", () => openSkillModal(card.dataset.skill)),
  );
skillModal?.addEventListener("click", (event) => {
  if (event.target.matches("[data-modal-close]")) closeSkillModal();
});
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && skillModal?.classList.contains("is-open"))
    closeSkillModal();
});

// Contact form: opens a prefilled email draft without requiring a backend.
const contactForm = document.querySelector("#contactForm");
const formStatus = document.querySelector("#formStatus");
contactForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(contactForm);
  const subject = encodeURIComponent(
    `Portfolio enquiry from ${data.get("name")}`,
  );
  const body = encodeURIComponent(
    `Name: ${data.get("name")}\nEmail: ${data.get("email")}\n\n${data.get("message")}`,
  );
  window.location.href = `mailto:phatsawat.b1@gmail.com?subject=${subject}&body=${body}`;
  if (formStatus) formStatus.textContent = "Opening your email app…";
});

const sendButton = contactForm?.querySelector('button[type="submit"]');
sendButton?.addEventListener("click", (event) => {
  const bounds = sendButton.getBoundingClientRect();
  const ripple = document.createElement("span");
  const size = Math.max(bounds.width, bounds.height) * 0.35;
  ripple.className = "ripple";
  ripple.style.width = `${size}px`;
  ripple.style.height = `${size}px`;
  ripple.style.left = `${event.clientX - bounds.left - size / 2}px`;
  ripple.style.top = `${event.clientY - bounds.top - size / 2}px`;
  sendButton.appendChild(ripple);
  window.setTimeout(() => ripple.remove(), 700);
});

contactForm?.addEventListener("submit", () => {
  sendButton?.classList.add("is-sent");
  if (sendButton) sendButton.firstChild.textContent = "Message ready ";
});
