(function () {
  const doc = document;

  const select = (selector, scope = doc) => scope.querySelector(selector);
  const selectAll = (selector, scope = doc) => Array.from(scope.querySelectorAll(selector));

  const dropdowns = selectAll("[data-dropdown]");

  const closeDropdowns = () => {
    dropdowns.forEach((dropdown) => {
      dropdown.classList.remove("is-open");
      const toggle = select("[data-dropdown-toggle]", dropdown);
      toggle?.setAttribute("aria-expanded", "false");
    });
  };

  dropdowns.forEach((dropdown) => {
    const toggle = select("[data-dropdown-toggle]", dropdown);
    if (!toggle) return;
    toggle.addEventListener("click", (event) => {
      event.preventDefault();
      const isOpen = dropdown.classList.contains("is-open");
      closeDropdowns();
      dropdown.classList.toggle("is-open", !isOpen);
      toggle.setAttribute("aria-expanded", String(!isOpen));
    });
  });

  doc.addEventListener("click", (event) => {
    if (!event.target.closest("[data-dropdown]")) {
      closeDropdowns();
    }
  });

  const themeToggle = selectAll("[data-theme-toggle]");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
  const THEME_KEY = "three-degree-theme";

  const applyTheme = (theme) => {
    const body = doc.body;
    if (theme === "dark") {
      body.classList.add("theme-dark");
      body.classList.remove("theme-light");
    } else {
      body.classList.add("theme-light");
      body.classList.remove("theme-dark");
    }
    localStorage.setItem(THEME_KEY, theme);
  };

  const initTheme = () => {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) {
      applyTheme(saved);
    } else {
      applyTheme(prefersDark.matches ? "dark" : "light");
    }
  };

  themeToggle.forEach((btn) =>
    btn.addEventListener("click", () => {
      const isDark = doc.body.classList.contains("theme-dark");
      applyTheme(isDark ? "light" : "dark");
    })
  );

  prefersDark.addEventListener("change", (event) => {
    if (!localStorage.getItem(THEME_KEY)) {
      applyTheme(event.matches ? "dark" : "light");
    }
  });

  initTheme();

  class Slider {
    constructor(root) {
      this.root = root;
      this.track = select(".slider-track, .carousel-track", root) || root;
      this.items = selectAll("[data-slider-item], .carousel-slide, figure", this.track);
      this.prevButton = select("[data-slider-prev]", root);
      this.nextButton = select("[data-slider-next]", root);
      this.dotsContainer = select("[data-slider-dots]", root);
      this.index = 0;
      this.autoInterval = null;
      this.isCarousel = root.dataset.slider === "gallery" || root.classList.contains("carousel");
      this.init();
    }

    init() {
      if (!this.track || this.items.length === 0) return;

      if (this.dotsContainer) {
        this.dotsContainer.innerHTML = "";
        this.items.forEach((_, idx) => {
          const btn = doc.createElement("button");
          if (idx === 0) btn.classList.add("is-active");
          btn.addEventListener("click", () => this.goTo(idx));
          this.dotsContainer.appendChild(btn);
        });
      }

      this.prevButton?.addEventListener("click", () => this.prev());
      this.nextButton?.addEventListener("click", () => this.next());

      if (this.isCarousel) {
        this.startAuto();
        this.root.addEventListener("mouseenter", () => this.stopAuto());
        this.root.addEventListener("mouseleave", () => this.startAuto());
      }

      this.goTo(0, true);
    }

    goTo(index, skipScroll = false) {
      if (!this.track) return;
      const max = this.items.length - 1;
      this.index = (index + this.items.length) % this.items.length;
      const item = this.items[this.index];

      if (this.dotsContainer) {
        selectAll("button", this.dotsContainer).forEach((dot, idx) => {
          dot.classList.toggle("is-active", idx === this.index);
        });
      }

      if (this.isCarousel) {
        const offset = item.offsetLeft;
        if (!skipScroll) {
          this.track.scrollTo({ left: offset, behavior: "smooth" });
        } else {
          this.track.scrollLeft = offset;
        }
      } else {
        const width = item.getBoundingClientRect().width;
        this.track.style.transform = `translateX(-${this.index * width}px)`;
      }
    }

    next() {
      this.goTo(this.index + 1);
    }

    prev() {
      this.goTo(this.index - 1);
    }

    startAuto() {
      if (this.autoInterval) return;
      this.autoInterval = window.setInterval(() => this.next(), 7000);
    }

    stopAuto() {
      if (this.autoInterval) {
        window.clearInterval(this.autoInterval);
        this.autoInterval = null;
      }
    }
  }

  selectAll("[data-slider]").forEach((slider) => new Slider(slider));

  const menuTabs = selectAll("[data-menu-tabs]");
  menuTabs.forEach((tabGroup) => {
    const buttons = selectAll(".menu-tab", tabGroup);
    const panels = selectAll("[data-menu-panel]");
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.dataset.category;
        buttons.forEach((b) => b.classList.toggle("is-active", b === btn));
        panels.forEach((panel) => {
          panel.classList.toggle("is-active", panel.dataset.menuPanel === target);
        });
      });
    });
  });

  const updateYear = () => {
    const yearSpans = selectAll("[data-year]");
    const year = new Date().getFullYear();
    yearSpans.forEach((span) => {
      span.textContent = String(year);
    });
  };
  updateYear();

  const countdowns = selectAll("[data-countdown]");
  countdowns.forEach((container) => {
    const targetDate = new Date(container.dataset.target || new Date());
    const daysEl = select("[data-countdown-days]", container);
    const hoursEl = select("[data-countdown-hours]", container);
    const minutesEl = select("[data-countdown-minutes]", container);
    const secondsEl = select("[data-countdown-seconds]", container);

    const tick = () => {
      const now = new Date();
      const diff = targetDate - now;
      if (diff <= 0) {
        daysEl.textContent = "00";
        hoursEl.textContent = "00";
        minutesEl.textContent = "00";
        secondsEl.textContent = "00";
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      daysEl.textContent = String(days).padStart(2, "0");
      hoursEl.textContent = String(hours).padStart(2, "0");
      minutesEl.textContent = String(minutes).padStart(2, "0");
      secondsEl.textContent = String(seconds).padStart(2, "0");
    };

    tick();
    setInterval(tick, 1000);
  });

  const forms = selectAll("[data-form]");
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const showFormMessage = (form, message, type = "error") => {
    let alert = select(".form-alert", form);
    if (!alert) {
      alert = doc.createElement("div");
      alert.className = "form-alert";
      form.prepend(alert);
    }
    alert.textContent = message;
    alert.dataset.type = type;
    alert.style.padding = "0.75rem 1rem";
    alert.style.borderRadius = "10px";
    alert.style.marginBottom = "1rem";
    alert.style.fontWeight = "600";
    alert.style.background =
      type === "success" ? "rgba(138, 163, 153, 0.18)" : "rgba(213, 80, 33, 0.12)";
    alert.style.color = type === "success" ? "#3f5f56" : "#8f2f12";
  };

  const validateForm = (form) => {
    const type = form.dataset.form;
    const elements = Array.from(form.elements);
    for (const el of elements) {
      if (el.disabled || el.type === "hidden" || el.type === "submit") continue;
      if (el.hasAttribute("required") && !el.value.trim()) {
        showFormMessage(form, "Please fill in all required fields.");
        el.focus();
        return false;
      }
      if (el.type === "email" && el.value && !emailPattern.test(el.value)) {
        showFormMessage(form, "Please enter a valid email address.");
        el.focus();
        return false;
      }
    }

    if (type === "register") {
      const password = form.elements.password;
      const confirm = form.elements.confirm;
      if (password && confirm && password.value !== confirm.value) {
        showFormMessage(form, "Passwords do not match.");
        confirm.focus();
        return false;
      }
    }

    if (type === "login" || type === "register") {
      const password = form.elements.password;
      if (password && password.value.length < 8) {
        showFormMessage(form, "Password must be at least 8 characters.");
        password.focus();
        return false;
      }
    }

    if (type === "reservation") {
      const date = form.elements.date;
      if (date) {
        const selected = new Date(date.value);
        if (Number.isNaN(selected.getTime()) || selected < new Date()) {
          showFormMessage(form, "Please choose a future reservation date.");
          date.focus();
          return false;
        }
      }
    }

    return true;
  };

  forms.forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!validateForm(form)) return;
      showFormMessage(form, "Thank you! We will be in touch shortly.", "success");
      form.reset();
    });
  });

  const modals = selectAll(".modal");
  const openModal = (selector) => {
    const modal = select(selector);
    if (!modal) return;
    modal.classList.add("is-open");
    doc.body.classList.add("no-scroll");
  };

  const closeModal = () => {
    modals.forEach((modal) => modal.classList.remove("is-open"));
    doc.body.classList.remove("no-scroll");
  };

  selectAll("[data-open-modal]").forEach((btn) => {
    btn.addEventListener("click", () => openModal(btn.dataset.openModal));
  });

  selectAll("[data-close-modal]").forEach((btn) =>
    btn.addEventListener("click", () => closeModal())
  );

  modals.forEach((modal) => {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) closeModal();
    });
  });

  doc.addEventListener("keyup", (event) => {
    if (event.key === "Escape") {
      closeModal();
      closeDropdowns();
    }
  });

  const adminSidebar = select("[data-admin-sidebar]");
  const sidebarToggleButtons = selectAll("[data-sidebar-toggle]");

  sidebarToggleButtons.forEach((btn) =>
    btn.addEventListener("click", () => {
      adminSidebar?.classList.toggle("is-open");
      doc.body.classList.toggle("no-scroll", adminSidebar?.classList.contains("is-open"));
    })
  );

  const charts = {
    orders: select("#ordersChart"),
    reservations: select("#reservationsChart"),
  };

  const drawLineChart = (canvas, dataPoints) => {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    const padding = 32;
    const maxValue = Math.max(...dataPoints) * 1.2;
    const stepX = (width - padding * 2) / (dataPoints.length - 1);

    ctx.lineWidth = 2;
    ctx.strokeStyle = getComputedStyle(doc.body).getPropertyValue("--color-sage");
    ctx.beginPath();
    dataPoints.forEach((value, index) => {
      const x = padding + index * stepX;
      const y = height - padding - (value / maxValue) * (height - padding * 2);
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    ctx.fillStyle = getComputedStyle(doc.body).getPropertyValue("--color-sage");
    dataPoints.forEach((value, index) => {
      const x = padding + index * stepX;
      const y = height - padding - (value / maxValue) * (height - padding * 2);
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  const drawBarChart = (canvas, dataSets) => {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    const padding = 32;
    const labels = dataSets.map((set) => set.label);
    const maxValue = Math.max(...dataSets.map((set) => set.value)) * 1.2;
    const barWidth = (width - padding * 2) / labels.length / 1.8;

    dataSets.forEach((set, index) => {
      const color = set.color;
      const x = padding + index * barWidth * 1.8;
      const y = height - padding - (set.value / maxValue) * (height - padding * 2);
      const barHeight = height - padding - y;

      ctx.fillStyle = color;
      ctx.roundRect(x, y, barWidth, barHeight, 6);
      ctx.fill();
    });
  };

  if (charts.orders) {
    drawLineChart(charts.orders, [40, 56, 42, 60, 72, 68, 80]);
  }

  if (charts.reservations) {
    const styles = getComputedStyle(doc.body);
    drawBarChart(charts.reservations, [
      { label: "Morning", value: 24, color: styles.getPropertyValue("--accent") },
      { label: "Afternoon", value: 36, color: styles.getPropertyValue("--color-sage") },
      { label: "Evening", value: 30, color: styles.getPropertyValue("--color-mocha") },
    ]);
  }

  CanvasRenderingContext2D.prototype.roundRect =
    CanvasRenderingContext2D.prototype.roundRect ||
    function (x, y, width, height, radius) {
      const r = typeof radius === "number" ? radius : 0;
      this.beginPath();
      this.moveTo(x + r, y);
      this.arcTo(x + width, y, x + width, y + height, r);
      this.arcTo(x + width, y + height, x, y + height, r);
      this.arcTo(x, y + height, x, y, r);
      this.arcTo(x, y, x + width, y, r);
      this.closePath();
      return this;
    };

  const accordionGroups = selectAll("[data-accordion]");
  accordionGroups.forEach((group) => {
    const items = selectAll(".accordion-item", group);
    items.forEach((item) => {
      const trigger = select(".accordion-trigger", item);
      const content = select(".accordion-content", item);
      trigger?.addEventListener("click", () => {
        const isOpen = item.classList.contains("is-open");
        items.forEach((other) => {
          other.classList.remove("is-open");
          const otherTrigger = select(".accordion-trigger", other);
          if (otherTrigger) otherTrigger.setAttribute("aria-expanded", "false");
        });
        if (!isOpen) {
          item.classList.add("is-open");
          trigger?.setAttribute("aria-expanded", "true");
        } else {
          item.classList.remove("is-open");
          trigger?.setAttribute("aria-expanded", "false");
        }
        if (content) {
          content.style.maxHeight = item.classList.contains("is-open")
            ? `${content.scrollHeight}px`
            : "0";
        }
      });

      if (content) {
        content.style.transition = "max-height 0.3s ease";
        content.style.overflow = "hidden";
        content.style.maxHeight = "0";
      }
    });
  });
})();








