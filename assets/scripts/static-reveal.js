(function () {
  var FOOTER_BACKGROUND = "./assets/images/footer-bg.svg";
  var TECH_SLIDE_AUTO_DELAY = 3600;
  var TECH_INTERACTION_PAUSE = 5200;
  var TESTIMONIAL_SPEED = 0.065;
  var ROTATOR_IDLE_SPEED = 0.018;
  var RESIZE_DEBOUNCE_MS = 160;
  var resizeTimer = 0;

  function injectStyles() {
    if (document.getElementById("static-site-restoration-styles")) {
      return;
    }

    var style = document.createElement("style");
    style.id = "static-site-restoration-styles";
    style.textContent = [
      ".static-reveal-target{opacity:0!important;visibility:visible!important;transform:var(--static-hidden-transform,translateY(18px));transition:opacity .75s ease,transform .75s cubic-bezier(.22,1,.36,1)!important;will-change:opacity,transform}",
      ".static-reveal-target.static-reveal-visible{opacity:1!important;transform:var(--static-visible-transform,none)!important}",
      ".static-map-pin-host{display:flex!important;justify-content:center;align-items:flex-start;overflow:visible}",
      ".static-map-pin{position:relative;display:block;width:18px;height:34px;pointer-events:none;filter:drop-shadow(0 8px 16px rgba(220,246,54,.3))}",
      ".static-map-pin::before{content:\"\";position:absolute;left:50%;top:0;width:14px;height:14px;border-radius:999px;transform:translateX(-50%);background:#dcf636;box-shadow:0 0 0 4px rgba(220,246,54,.18)}",
      ".static-map-pin::after{content:\"\";position:absolute;left:50%;top:11px;width:2px;height:22px;transform:translateX(-50%);border-radius:999px;background:linear-gradient(180deg,rgba(220,246,54,.95),rgba(220,246,54,0))}",
      ".static-tech-carousel{opacity:1!important;visibility:visible!important;position:relative!important}",
      ".static-tech-viewport{position:relative!important;overflow:hidden!important;height:100%!important}",
      ".static-tech-track{display:flex!important;flex-direction:row!important;align-items:stretch!important;gap:0!important;height:100%!important;margin:0!important;padding:0!important;list-style:none!important;will-change:transform;transition:transform .72s cubic-bezier(.22,1,.36,1)!important}",
      ".static-tech-track.is-dragging{transition:none!important}",
      ".static-tech-slide-item{display:block!important;flex:0 0 auto!important;height:100%!important;list-style:none!important}",
      ".static-tech-slide{position:relative!important;width:100%!important;height:100%!important;opacity:1!important;visibility:visible!important;transform:none!important;overflow:hidden}",
      ".static-tech-slide .static-slide-fallback,.static-tech-slide .static-slide-caption{display:none!important}",
      ".static-tech-slide [data-uzhnaq-background-image-wrapper=\"true\"]{position:absolute!important;inset:0!important}",
      ".static-tech-slide [data-uzhnaq-background-image-wrapper=\"true\"] img{width:100%!important;height:100%!important;object-fit:contain!important;object-position:center center!important}",
      ".static-tech-controls{position:absolute;right:18px;bottom:18px;display:flex;align-items:center;gap:10px;z-index:8}",
      ".static-tech-button{appearance:none;border:1px solid rgba(255,255,255,.18);background:rgba(8,8,10,.72);color:#fff;width:46px;height:46px;border-radius:999px;display:inline-flex;align-items:center;justify-content:center;font:600 18px/1 Manrope,Arial,sans-serif;cursor:pointer;backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);transition:background .25s ease,border-color .25s ease,transform .25s ease}",
      ".static-tech-button:hover{background:rgba(18,18,22,.9);border-color:rgba(220,246,54,.6);transform:translateY(-1px)}",
      ".static-tech-button:focus-visible{outline:2px solid rgba(220,246,54,.88);outline-offset:2px}",
      ".static-tech-status{min-width:76px;padding:10px 14px;border-radius:999px;border:1px solid rgba(255,255,255,.16);background:rgba(8,8,10,.62);color:#fff;font:700 12px/1 Manrope,Arial,sans-serif;letter-spacing:.18em;text-align:center;text-transform:uppercase}",
      ".static-industries-rotator{cursor:grab;touch-action:pan-y;user-select:none}",
      ".static-industries-rotator.is-dragging{cursor:grabbing}",
      ".static-industries-rotator [data-uzhnaq-name=\"Images\"]{transform-style:preserve-3d!important;will-change:transform}",
      ".static-testimonials{opacity:1!important;visibility:visible!important;overflow:hidden!important;cursor:grab;touch-action:pan-y;user-select:none}",
      ".static-testimonials.is-dragging{cursor:grabbing}",
      ".static-testimonials-track{display:flex!important;flex-wrap:nowrap!important;align-items:stretch!important;will-change:transform}",
      ".static-testimonial-item{flex:0 0 auto!important}",
      "@media (max-width: 809.98px){.static-tech-controls{right:12px;bottom:12px;gap:8px}.static-tech-button{width:40px;height:40px;font-size:16px}.static-tech-status{min-width:64px;padding:9px 12px;font-size:11px}}"
    ].join("");

    document.head.appendChild(style);
  }

  function cleanupBadge() {
    var badge = document.getElementById("__uzhnaq-badge-container");
    if (badge) {
      badge.remove();
    }
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function padNumber(value) {
    return value < 10 ? "0" + value : String(value);
  }

  function isRenderable(element) {
    var current = element;

    if (
      !(element instanceof HTMLElement) ||
      !element.isConnected ||
      element.offsetWidth <= 0 ||
      element.offsetHeight <= 0
    ) {
      return false;
    }

    while (current instanceof HTMLElement) {
      var style = window.getComputedStyle(current);
      if (style.display === "none" || style.visibility === "hidden") {
        return false;
      }
      current = current.parentElement;
    }

    return element.getClientRects().length > 0;
  }

  function normalizeTransform(transform) {
    var next = (transform || "").trim();

    if (!next) {
      return "none";
    }

    next = next.replace(/\s*perspective\(1200px\)\s*/g, " ");
    next = next.replace(/\s*translateY\((-?(?:5|10|15|18|22|40|50|150))px\)\s*/g, " ");
    next = next.replace(/\s*scale\(0?\.?(?:5|98|985)\)\s*/g, " ");
    next = next.replace(/\s{2,}/g, " ").trim();

    if (!next || next === "translateY(0px)") {
      return "none";
    }

    return next;
  }

  function shouldReveal(element) {
    var inlineStyle = element.getAttribute("style") || "";
    var opacity = element.style.opacity || "";
    var visibility = element.style.visibility || "";
    var transform = element.style.transform || "";
    var willChange = element.style.willChange || "";
    var hasAppearId = element.hasAttribute("data-uzhnaq-appear-id");
    var hasHiddenOpacity = /opacity:\s*(0(?:\.001)?|0\.2)(?:;|$)/.test(inlineStyle);
    var hasHiddenVisibility = /visibility:\s*hidden(?:;|$)/.test(inlineStyle) || visibility === "hidden";

    if (!(element instanceof HTMLElement)) {
      return false;
    }

    if (element.closest("#__uzhnaq-badge-container")) {
      return false;
    }

    if (element.getAttribute("aria-hidden") === "true") {
      return false;
    }

    if (
      element.closest("[data-static-tech-carousel-root]") ||
      element.closest("[data-static-testimonials-root]") ||
      element.closest("[data-static-industries-rotator-root]")
    ) {
      return false;
    }

    if (element.matches("img,svg,path")) {
      return false;
    }

    if (element.children.length === 1) {
      var onlyChild = element.firstElementChild;
      if (
        onlyChild instanceof HTMLElement &&
        onlyChild.style.display === "contents" &&
        !element.textContent.trim()
      ) {
        return false;
      }
    }

    if (hasAppearId) {
      return true;
    }

    if (hasHiddenVisibility) {
      return true;
    }

    if (!hasHiddenOpacity && opacity !== "0" && opacity !== "0.001" && opacity !== "0.2") {
      return false;
    }

    if (element.dataset && element.dataset.uzhnaqName === "Links" && !willChange && !transform) {
      return false;
    }

    return true;
  }

  function prepareRevealTarget(element, index) {
    if (element.dataset.staticRevealPrepared === "true") {
      return;
    }

    var originalTransform = (element.style.transform || "").trim();
    var visibleTransform = normalizeTransform(originalTransform);
    var hiddenTransform = originalTransform || "translateY(18px)";

    element.dataset.staticRevealPrepared = "true";
    element.style.setProperty("--static-hidden-transform", hiddenTransform);
    element.style.setProperty("--static-visible-transform", visibleTransform);
    element.style.transitionDelay = Math.min(index * 45, 320) + "ms";
    element.style.visibility = "visible";
    element.classList.add("static-reveal-target");
  }

  function revealElement(element) {
    if (element.dataset.staticRevealDone === "true") {
      return;
    }

    element.dataset.staticRevealDone = "true";
    element.classList.add("static-reveal-visible");
    element.style.removeProperty("will-change");
  }

  function initRevealAnimations() {
    var revealTargets = [];

    document.querySelectorAll("[style], [data-uzhnaq-appear-id]").forEach(function (element) {
      if (!shouldReveal(element)) {
        return;
      }

      prepareRevealTarget(element, revealTargets.length);
      revealTargets.push(element);
    });

    if (revealTargets.length === 0) {
      return;
    }

    var revealAboveFold = function () {
      revealTargets.forEach(function (element) {
        if (element.dataset.staticRevealDone === "true") {
          return;
        }

        var rect = element.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.92) {
          revealElement(element);
        }
      });
    };

    if (!("IntersectionObserver" in window)) {
      revealTargets.forEach(revealElement);
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          return;
        }

        revealElement(entry.target);
        observer.unobserve(entry.target);
      });
    }, {
      rootMargin: "0px 0px -10% 0px",
      threshold: 0.08
    });

    revealTargets.forEach(function (element) {
      observer.observe(element);
    });

    window.requestAnimationFrame(revealAboveFold);
    window.setTimeout(revealAboveFold, 450);
  }

  function swapFooterBackgrounds() {
    document.querySelectorAll('img[src*="1wzZwBziFW78fmeGpplygdIa2qw"]').forEach(function (image) {
      image.setAttribute("src", FOOTER_BACKGROUND);
      image.setAttribute("srcset", FOOTER_BACKGROUND + " 1440w");
      image.removeAttribute("sizes");
      image.removeAttribute("data-uzhnaq-original-sizes");
      image.setAttribute("width", "1440");
      image.setAttribute("height", "810");
    });
  }

  function initMapPins() {
    document.querySelectorAll('img[src*="50pPxGlN45r3Ut7lZNgyiMG5g"]').forEach(function (image) {
      var mapRoot = image.closest("div");

      while (mapRoot) {
        if (
          mapRoot.querySelectorAll('div[class$="-container"] > div[style="display:contents"]').length >= 8
        ) {
          break;
        }

        mapRoot = mapRoot.parentElement;
      }

      if (!mapRoot) {
        return;
      }

      Array.from(mapRoot.children).forEach(function (child) {
        if (!(child instanceof HTMLElement)) {
          return;
        }

        if (!/-container$/.test(child.className || "")) {
          return;
        }

        if (child.dataset.staticMapPin === "true") {
          return;
        }

        if (child.children.length !== 1) {
          return;
        }

        var placeholder = child.firstElementChild;
        if (!(placeholder instanceof HTMLElement) || placeholder.style.display !== "contents") {
          return;
        }

        child.dataset.staticMapPin = "true";
        child.classList.add("static-map-pin-host");
        child.style.opacity = "1";
        child.style.visibility = "visible";
        child.style.removeProperty("will-change");
        child.innerHTML = '<span class="static-map-pin" aria-hidden="true"></span>';
        child.classList.add("static-reveal-target");
        child.style.setProperty("--static-hidden-transform", "translateY(-10px)");
        child.style.setProperty("--static-visible-transform", normalizeTransform(child.style.transform || ""));
        window.setTimeout(function () {
          child.classList.add("static-reveal-visible");
        }, 80);
      });
    });
  }

  function createControlButton(symbol, label) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "static-tech-button";
    button.setAttribute("aria-label", label);
    button.textContent = symbol;
    return button;
  }

  function initTechnologyCarousels() {
    document.querySelectorAll("section").forEach(function (section) {
      if (!(section instanceof HTMLElement)) {
        return;
      }

      var hiddenSlides = Array.from(section.querySelectorAll("li > div")).filter(function (slide) {
        return slide instanceof HTMLElement && slide.style.visibility === "hidden";
      });

      if (hiddenSlides.length < 2 || !isRenderable(section)) {
        return;
      }

      if (section.__staticTechCarousel) {
        section.__staticTechCarousel.refresh();
        return;
      }

      var viewport = section.firstElementChild;
      var track = section.querySelector("ul");
      var controls = section.querySelector(".uzhnaq--slideshow-controls");

      Array.from(track ? track.children : []).forEach(function (item) {
        if (!(item instanceof HTMLElement)) {
          return;
        }

        if (item.getAttribute("aria-hidden") === "true") {
          item.remove();
        }
      });

      var items = Array.from(track ? track.children : []).filter(function (item) {
        return item instanceof HTMLElement;
      });
      var prevButton = controls && controls.querySelector('button[aria-label="Previous"]');
      var nextButton = controls && controls.querySelector('button[aria-label="Next"]');
      var pagerButtons = Array.from(
        controls ? controls.querySelectorAll('button[aria-label^="Scroll to page "]') : [],
      ).filter(function (button) {
        return button instanceof HTMLButtonElement;
      });

      if (!(viewport instanceof HTMLElement) || !(track instanceof HTMLElement) || items.length < 2) {
        return;
      }

      section.dataset.staticTechCarouselRoot = "true";
      section.style.opacity = "1";
      section.style.visibility = "visible";
      section.classList.add("static-tech-carousel");
      viewport.classList.add("static-tech-viewport");
      track.classList.add("static-tech-track");

      items.forEach(function (item) {
        item.classList.add("static-tech-slide-item");
        item.style.display = "block";
        item.style.listStyle = "none";

        var slide = item.firstElementChild;
        if (!(slide instanceof HTMLElement)) {
          return;
        }

        slide.classList.add("static-tech-slide");
        slide.style.visibility = "visible";
        slide.style.opacity = "1";
        slide.style.removeProperty("transform-origin");
        slide.querySelectorAll(".static-slide-fallback, .static-slide-caption").forEach(function (node) {
          node.remove();
        });

        Array.from(slide.querySelectorAll("img")).forEach(function (image) {
          image.addEventListener("error", function () {
            image.style.opacity = "0";
          }, { once: true });
        });
      });

      var state = {
        index: 0,
        slideWidth: 0,
        timer: 0,
        dragStartX: 0,
        dragDelta: 0,
        dragging: false,
        pointerId: null
      };

      function updateStatus() {
        var activeIndex = state.index % items.length;

        pagerButtons.forEach(function (button, index) {
          var active = index === activeIndex;
          button.hidden = index >= items.length;
          button.setAttribute("aria-current", active ? "true" : "false");
          button.style.pointerEvents = index < items.length ? "auto" : "none";

          var dot = button.firstElementChild;
          if (dot instanceof HTMLElement) {
            dot.style.opacity = active ? "1" : "0.45";
            dot.style.transform = active ? "scale(1)" : "scale(0.88)";
            dot.style.transition = "opacity .2s ease, transform .2s ease";
          }
        });

        [prevButton, nextButton].forEach(function (button) {
          if (!(button instanceof HTMLButtonElement)) {
            return;
          }

          button.disabled = items.length < 2;
          button.style.opacity = items.length < 2 ? "0.45" : "1";
          button.style.cursor = items.length < 2 ? "default" : "pointer";
        });
      }

      function applyTransform(animate, deltaX) {
        var offset = -state.index * state.slideWidth + (deltaX || 0);
        track.style.transition = animate ? "" : "none";
        track.style.transform = "translate3d(" + offset + "px,0,0)";
      }

      function scheduleAuto(delay) {
        window.clearTimeout(state.timer);
        state.timer = window.setTimeout(function () {
          goTo(state.index + 1, true);
        }, delay || TECH_SLIDE_AUTO_DELAY);
      }

      function goTo(nextIndex, animate) {
        var total = items.length;
        state.index = ((nextIndex % total) + total) % total;
        applyTransform(animate !== false, 0);
        updateStatus();
        scheduleAuto(TECH_SLIDE_AUTO_DELAY);
      }

      function refresh() {
        if (!isRenderable(section)) {
          return;
        }

        state.slideWidth = Math.max(viewport.clientWidth, 1);
        track.style.width = state.slideWidth * items.length + "px";

        items.forEach(function (item) {
          item.style.width = state.slideWidth + "px";
          item.style.flexBasis = state.slideWidth + "px";
        });

        applyTransform(false, 0);
        updateStatus();
      }

      function handlePointerDown(event) {
        if (event.pointerType === "mouse" && event.button !== 0) {
          return;
        }

        if (
          event.target instanceof HTMLElement &&
          event.target.closest(".static-tech-controls, button, a, input, textarea, select")
        ) {
          return;
        }

        state.dragging = true;
        state.pointerId = event.pointerId;
        state.dragStartX = event.clientX;
        state.dragDelta = 0;
        track.classList.add("is-dragging");
        window.clearTimeout(state.timer);

        if (section.setPointerCapture) {
          section.setPointerCapture(event.pointerId);
        }
      }

      function handlePointerMove(event) {
        if (!state.dragging || event.pointerId !== state.pointerId) {
          return;
        }

        state.dragDelta = event.clientX - state.dragStartX;
        applyTransform(false, state.dragDelta);
      }

      function handlePointerUp(event) {
        if (!state.dragging || event.pointerId !== state.pointerId) {
          return;
        }

        state.dragging = false;
        track.classList.remove("is-dragging");

        if (section.releasePointerCapture) {
          try {
            section.releasePointerCapture(event.pointerId);
          } catch (error) {
            // Ignore capture release errors from synthetic unload cases.
          }
        }

        var threshold = state.slideWidth * 0.12;
        if (Math.abs(state.dragDelta) > threshold) {
          goTo(state.index + (state.dragDelta < 0 ? 1 : -1), true);
        } else {
          applyTransform(true, 0);
          updateStatus();
          scheduleAuto(TECH_INTERACTION_PAUSE);
        }
      }

      if (prevButton instanceof HTMLButtonElement) {
        prevButton.addEventListener("click", function () {
          goTo(state.index - 1, true);
        });
      }

      if (nextButton instanceof HTMLButtonElement) {
        nextButton.addEventListener("click", function () {
          goTo(state.index + 1, true);
        });
      }

      pagerButtons.forEach(function (button, index) {
        if (index >= items.length) {
          button.hidden = true;
          return;
        }

        button.addEventListener("click", function () {
          goTo(index, true);
        });
      });

      section.addEventListener("pointerdown", handlePointerDown);
      section.addEventListener("pointermove", handlePointerMove);
      section.addEventListener("pointerup", handlePointerUp);
      section.addEventListener("pointercancel", handlePointerUp);
      section.addEventListener("mouseenter", function () {
        window.clearTimeout(state.timer);
      });
      section.addEventListener("mouseleave", function () {
        if (!state.dragging) {
          scheduleAuto(TECH_SLIDE_AUTO_DELAY);
        }
      });

      section.__staticTechCarousel = {
        refresh: refresh
      };

      refresh();
      goTo(0, false);
    });
  }

  function parseRotateY(transform) {
    var match = /rotateY\((-?\d+(?:\.\d+)?)deg\)/.exec(transform || "");
    return match ? parseFloat(match[1]) : 0;
  }

  function initIndustriesRotators() {
    document.querySelectorAll('[data-uzhnaq-name="Images"]').forEach(function (imagesRoot) {
      if (!(imagesRoot instanceof HTMLElement) || !isRenderable(imagesRoot)) {
        return;
      }

      var wraps = Array.from(imagesRoot.querySelectorAll(':scope > [data-uzhnaq-name="Image Wrap"]'));
      if (wraps.length < 5) {
        return;
      }

      var root = imagesRoot.closest('[tabindex="0"]');
      if (!(root instanceof HTMLElement)) {
        root = imagesRoot;
      }

      if (root.__staticIndustriesRotator) {
        root.__staticIndustriesRotator.refresh();
        return;
      }

      root.dataset.staticIndustriesRotatorRoot = "true";
      root.classList.add("static-industries-rotator");

      var state = {
        angle: parseRotateY(imagesRoot.style.transform),
        velocity: ROTATOR_IDLE_SPEED,
        dragging: false,
        pointerId: null,
        startX: 0,
        startAngle: 0,
        lastX: 0,
        lastMoveTime: 0,
        lastDeltaX: 0,
        lastFrameTime: 0,
        frame: 0
      };

      function applyRotation() {
        imagesRoot.style.transform = "rotateY(" + state.angle.toFixed(3) + "deg)";
      }

      function animate(timestamp) {
        if (!state.lastFrameTime) {
          state.lastFrameTime = timestamp;
        }

        var delta = Math.min(timestamp - state.lastFrameTime, 40);
        state.lastFrameTime = timestamp;

        if (!state.dragging) {
          state.angle += state.velocity * delta;
          state.velocity += (ROTATOR_IDLE_SPEED - state.velocity) * 0.02 * (delta / 16.67);
          applyRotation();
        }

        state.frame = window.requestAnimationFrame(animate);
      }

      function handlePointerDown(event) {
        if (event.pointerType === "mouse" && event.button !== 0) {
          return;
        }

        state.dragging = true;
        state.pointerId = event.pointerId;
        state.startX = event.clientX;
        state.startAngle = state.angle;
        state.lastX = event.clientX;
        state.lastMoveTime = performance.now();
        state.lastDeltaX = 0;
        state.velocity = 0;
        root.classList.add("is-dragging");

        if (root.setPointerCapture) {
          root.setPointerCapture(event.pointerId);
        }
      }

      function handlePointerMove(event) {
        if (!state.dragging || event.pointerId !== state.pointerId) {
          return;
        }

        var now = performance.now();
        var deltaX = event.clientX - state.startX;
        state.angle = state.startAngle + deltaX * 0.2;
        state.lastDeltaX = event.clientX - state.lastX;
        state.lastX = event.clientX;
        state.lastMoveTime = now;
        applyRotation();
      }

      function handlePointerUp(event) {
        if (!state.dragging || event.pointerId !== state.pointerId) {
          return;
        }

        state.dragging = false;
        root.classList.remove("is-dragging");

        if (root.releasePointerCapture) {
          try {
            root.releasePointerCapture(event.pointerId);
          } catch (error) {
            // Ignore capture release errors from synthetic unload cases.
          }
        }

        state.velocity = clamp(state.lastDeltaX * 0.02, -0.55, 0.55);
        if (Math.abs(state.velocity) < 0.06) {
          state.velocity = state.velocity < 0 ? -ROTATOR_IDLE_SPEED : ROTATOR_IDLE_SPEED;
        }
      }

      function refresh() {
        applyRotation();
      }

      root.addEventListener("pointerdown", handlePointerDown);
      root.addEventListener("pointermove", handlePointerMove);
      root.addEventListener("pointerup", handlePointerUp);
      root.addEventListener("pointercancel", handlePointerUp);

      root.__staticIndustriesRotator = {
        refresh: refresh
      };

      applyRotation();
      state.frame = window.requestAnimationFrame(animate);
    });
  }

  function initTestimonials() {
    document.querySelectorAll('[data-uzhnaq-name="Testimonials"] section').forEach(function (section) {
      if (!(section instanceof HTMLElement) || !isRenderable(section)) {
        return;
      }

      var track = section.querySelector("ul");
      var items = Array.from(track ? track.children : []).filter(function (item) {
        return item instanceof HTMLElement && item.querySelector('[data-uzhnaq-name="Card"]');
      });

      if (!(track instanceof HTMLElement) || items.length < 2) {
        return;
      }

      if (section.__staticTestimonials) {
        section.__staticTestimonials.refresh();
        return;
      }

      section.dataset.staticTestimonialsRoot = "true";
      section.classList.add("static-testimonials");
      section.style.opacity = "1";
      section.style.visibility = "visible";
      track.classList.add("static-testimonials-track");

      items.forEach(function (item) {
        item.classList.add("static-testimonial-item");
      });

      var state = {
        originals: items.slice(),
        offset: 0,
        maxOffset: 0,
        direction: 1,
        dragging: false,
        pointerId: null,
        startX: 0,
        startOffset: 0,
        lastFrameTime: 0,
        pauseUntil: 0,
        lastDeltaX: 0,
        frame: 0
      };

      function applyOffset() {
        track.style.transform = "translate3d(" + (-state.offset).toFixed(2) + "px,0,0)";
      }

      function rebuildClones() {
        Array.from(track.querySelectorAll('[data-static-testimonial-clone="true"]')).forEach(function (clone) {
          clone.remove();
        });

        var viewportWidth = section.clientWidth;
        var safety = 0;

        while (track.scrollWidth <= viewportWidth * 1.4 && safety < 2) {
          state.originals.forEach(function (item) {
            var clone = item.cloneNode(true);
            clone.dataset.staticTestimonialClone = "true";
            clone.setAttribute("aria-hidden", "true");
            clone.classList.add("static-testimonial-item");
            track.appendChild(clone);
          });
          safety += 1;
        }

        state.maxOffset = Math.max(track.scrollWidth - viewportWidth, 0);
        state.offset = clamp(state.offset, 0, state.maxOffset);
        applyOffset();
      }

      function refresh() {
        if (!isRenderable(section)) {
          return;
        }

        rebuildClones();
      }

      function animate(timestamp) {
        if (!state.lastFrameTime) {
          state.lastFrameTime = timestamp;
        }

        var delta = Math.min(timestamp - state.lastFrameTime, 40);
        state.lastFrameTime = timestamp;

        if (!state.dragging && state.maxOffset > 0 && timestamp >= state.pauseUntil) {
          state.offset += state.direction * TESTIMONIAL_SPEED * delta;

          if (state.offset <= 0) {
            state.offset = 0;
            state.direction = 1;
            state.pauseUntil = timestamp + 700;
          } else if (state.offset >= state.maxOffset) {
            state.offset = state.maxOffset;
            state.direction = -1;
            state.pauseUntil = timestamp + 700;
          }

          applyOffset();
        }

        state.frame = window.requestAnimationFrame(animate);
      }

      function handlePointerDown(event) {
        if (event.pointerType === "mouse" && event.button !== 0) {
          return;
        }

        if (
          event.target instanceof HTMLElement &&
          event.target.closest("button, a, input, textarea, select")
        ) {
          return;
        }

        state.dragging = true;
        state.pointerId = event.pointerId;
        state.startX = event.clientX;
        state.startOffset = state.offset;
        state.lastDeltaX = 0;
        section.classList.add("is-dragging");
        state.pauseUntil = performance.now() + 1600;

        if (section.setPointerCapture) {
          section.setPointerCapture(event.pointerId);
        }
      }

      function handlePointerMove(event) {
        if (!state.dragging || event.pointerId !== state.pointerId) {
          return;
        }

        state.lastDeltaX = event.clientX - state.startX;
        state.offset = clamp(state.startOffset - state.lastDeltaX, 0, state.maxOffset);
        applyOffset();
      }

      function handlePointerUp(event) {
        if (!state.dragging || event.pointerId !== state.pointerId) {
          return;
        }

        state.dragging = false;
        section.classList.remove("is-dragging");

        if (section.releasePointerCapture) {
          try {
            section.releasePointerCapture(event.pointerId);
          } catch (error) {
            // Ignore capture release errors from synthetic unload cases.
          }
        }

        if (Math.abs(state.lastDeltaX) > 6) {
          state.direction = state.lastDeltaX < 0 ? 1 : -1;
        }

        state.pauseUntil = performance.now() + 1400;
      }

      section.addEventListener("pointerdown", handlePointerDown);
      section.addEventListener("pointermove", handlePointerMove);
      section.addEventListener("pointerup", handlePointerUp);
      section.addEventListener("pointercancel", handlePointerUp);

      section.__staticTestimonials = {
        refresh: refresh
      };

      refresh();
      state.frame = window.requestAnimationFrame(animate);
    });
  }

  function initStaticRestorations() {
    injectStyles();
    cleanupBadge();
    swapFooterBackgrounds();
    initMapPins();
    initTechnologyCarousels();
    initIndustriesRotators();
    initTestimonials();
    initRevealAnimations();
  }

  function scheduleRefresh() {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(function () {
      swapFooterBackgrounds();
      initMapPins();
      initTechnologyCarousels();
      initIndustriesRotators();
      initTestimonials();
      initRevealAnimations();
    }, RESIZE_DEBOUNCE_MS);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initStaticRestorations, { once: true });
  } else {
    initStaticRestorations();
  }

  window.addEventListener("load", initStaticRestorations, { once: true });
  window.addEventListener("resize", scheduleRefresh);
  window.addEventListener("orientationchange", scheduleRefresh);
})();
