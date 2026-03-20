document.addEventListener("DOMContentLoaded", () => {
  const currentPath = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
  const prefersHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const isFileProtocol = window.location.protocol === "file:";
  const pageOrigin = /^https?:/i.test(window.location.origin || "") ? window.location.origin : "";
  const youtubeVideoId = "M7lc1UVf-VE";
  const youtubeWatchUrl = `https://www.youtube.com/watch?v=${youtubeVideoId}`;
  const youtubeChannelUrl = "https://www.youtube.com/@UZHNAQTECHNOLOGYPVTLTD";
  const youtubeEmbedUrl = buildYouTubeEmbedUrl();
  const footerBlueprintAsset = "./assets/footer/blueprint-bg.png";
  const footerGearOverlayAsset = "./assets/footer/gear-overlay.png";
  const dropdownGroups = {
    "About Us": {
      triggerId: "undefined-1njxbrf",
      lead: "Quick links to the story, direction, and people behind UZHNAQ.",
      items: [
        { title: "Our Mission", subtitle: "What drives the company", href: "./about.html#mission" },
        { title: "Our Vision", subtitle: "Where we are heading", href: "./about.html#vision" },
        { title: "Our Promise", subtitle: "Quality and delivery standards", href: "./about.html#promise" },
        { title: "Leadership Team", subtitle: "Meet the people behind UZHNAQ", href: "./about.html#team" },
      ],
    },
    Products: {
      triggerId: "undefined-14p26ei",
      lead: "Jump directly to core drivetrain and transmission components.",
      items: [
        { title: "Main Drive", subtitle: "Heavy-duty gear systems", href: "./products.html#maindrive" },
        { title: "Differential Gear", subtitle: "Balanced torque transfer", href: "./products.html#differentialgear" },
        { title: "Planet Gear", subtitle: "Compact power distribution", href: "./products.html#planetgear" },
        { title: "Synchro Assembly", subtitle: "Smooth shifting components", href: "./products.html#synchroassembly" },
      ],
    },
  };
  const inlineFooterIcons = {
    world: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12h18"/><path d="M12 3a15.3 15.3 0 0 1 4 9 15.3 15.3 0 0 1-4 9 15.3 15.3 0 0 1-4-9 15.3 15.3 0 0 1 4-9Z"/><path d="M20 7.5A11 11 0 0 0 4 7.5"/><path d="M20 16.5A11 11 0 0 1 4 16.5"/></svg>`,
    mail: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg>`,
    phone: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4.5h3.2l1.6 4.2-1.9 1.8a15 15 0 0 0 5.2 5.2l1.8-1.9 4.2 1.6V19a1.5 1.5 0 0 1-1.5 1.5C10 20.5 3.5 14 3.5 6A1.5 1.5 0 0 1 5 4.5Z"/></svg>`,
    mapPin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s6-5.8 6-11a6 6 0 1 0-12 0c0 5.2 6 11 6 11Z"/><circle cx="12" cy="10" r="2.4"/></svg>`,
    youtube: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.5 8.5A2.5 2.5 0 0 1 5 6h14a2.5 2.5 0 0 1 2.5 2.5v7A2.5 2.5 0 0 1 19 18H5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="m10 9 5 3-5 3z"/></svg>`,
    instagram: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="4"/><circle cx="12" cy="12" r="3.2"/><circle cx="17.2" cy="6.8" r="0.8" fill="currentColor" stroke="none"/></svg>`,
  };

  decorateHeaderNavigation();
  highlightActiveLinks();
  initializeDropdowns();
  initializeEnquiryForms();
  initializeFooterEnhancements();

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeAttribute(value) {
    return escapeHtml(value);
  }

  function buildYouTubeEmbedUrl() {
    return `https://www.youtube.com/embed/${youtubeVideoId}?rel=0&modestbranding=1&playsinline=1`;
  }

  function extractText(element) {
    return (element?.textContent || "").replace(/\s+/g, " ").trim();
  }

  function createExternalHref(value) {
    const trimmedValue = extractText({ textContent: value });
    if (!trimmedValue) {
      return "";
    }

    return /^https?:\/\//i.test(trimmedValue) ? trimmedValue : `https://${trimmedValue.replace(/^\/+/, "")}`;
  }

  function createPhoneHref(value) {
    const trimmedValue = extractText({ textContent: value });
    const normalizedValue = trimmedValue.replace(/(?!^\+)[^\d]/g, "");
    return normalizedValue ? `tel:${normalizedValue}` : "";
  }

  function cloneNewsletterForm(sourceContainer) {
    if (!(sourceContainer instanceof HTMLElement)) {
      return null;
    }

    const clone = sourceContainer.cloneNode(true);
    clone.classList.add("site-footer-newsletter-form-shell");
    clone.removeAttribute("style");

    const visibleWrapper = clone.firstElementChild;
    if (visibleWrapper instanceof HTMLElement) {
      visibleWrapper.classList.add("site-footer-newsletter-form-frame");
      visibleWrapper.removeAttribute("style");
    }

    const form = clone.querySelector("form");
    if (!(form instanceof HTMLFormElement)) {
      return clone;
    }

    form.classList.add("site-footer-newsletter-form");
    form.removeAttribute("style");

    const emailInput = form.querySelector('input[type="email"]');
    if (emailInput instanceof HTMLInputElement) {
      emailInput.classList.add("site-footer-email-input");
      emailInput.removeAttribute("style");
      emailInput.setAttribute("autocomplete", "email");
      emailInput.setAttribute("aria-label", emailInput.getAttribute("placeholder") || "Email address");
    }

    const submitControl = form.querySelector('input[type="submit"], button[type="submit"]');
    if (submitControl instanceof HTMLElement) {
      submitControl.classList.add("site-footer-submit-button");
      submitControl.removeAttribute("style");

      const submitWrapper = submitControl.parentElement;
      if (submitWrapper instanceof HTMLElement && submitWrapper !== form) {
        submitWrapper.classList.add("site-footer-submit-wrap");
        submitWrapper.removeAttribute("style");
      }
    }

    return clone;
  }

  function collectFooterData(root) {
    const headline =
      extractText(root.querySelector(".uzhnaq-1r1llpm")).replace(/\s+([!?.,:;])/g, "$1") ||
      "Partner with Us for Excellence!";
    const website = extractText(root.querySelector(".uzhnaq-155pa7s"));
    const email = extractText(root.querySelector(".uzhnaq-cpge1f"));
    const phone = extractText(root.querySelector(".uzhnaq-xkjyig"));
    const address = extractText(root.querySelector(".uzhnaq-9pv2is"));
    const newsletterTitle =
      extractText(root.querySelector(".uzhnaq-1wpygkq")) || "Subscribe to our newsletter";
    const newsletterCopy =
      extractText(root.querySelector(".uzhnaq-1mu0ah0")) || "Send in your email and receive all updates!";

    const contactItems = [
      {
        icon: "world",
        label: website,
        href: createExternalHref(website),
        external: Boolean(website),
      },
      {
        icon: "mail",
        label: email,
        href: email ? `mailto:${email}` : "",
      },
      {
        icon: "phone",
        label: phone,
        href: createPhoneHref(phone),
      },
      {
        icon: "mapPin",
        label: address,
        href: "",
      },
    ].filter((item) => item.label);

    const socialItems = Array.from(
      root.querySelectorAll(".uzhnaq-ny70h5, .uzhnaq-sqx387, .uzhnaq-xa3te1, .uzhnaq-hsibnc"),
    )
      .map((item) => {
        const anchor = item.querySelector("a[href]");
        const rawLabel = extractText(anchor || item);
        const normalizedLabel = rawLabel.toLowerCase();
        const label = normalizedLabel.includes("youtube")
          ? "YouTube"
          : normalizedLabel.includes("instagram")
            ? "Instagram"
            : rawLabel;
        const icon = normalizedLabel.includes("youtube")
          ? "youtube"
          : normalizedLabel.includes("instagram")
            ? "instagram"
            : "world";

        return {
          icon,
          label,
          href: anchor?.getAttribute("href") || "",
          external: Boolean(anchor?.getAttribute("href")),
        };
      })
      .filter((item) => item.label && item.href);

    const legalItems = Array.from(root.querySelectorAll(".uzhnaq-1jupf1z > *"))
      .map((item) => extractText(item))
      .filter(Boolean);

    return {
      headline,
      contactItems,
      socialItems,
      newsletterTitle,
      newsletterCopy,
      newsletterForm: cloneNewsletterForm(root.querySelector(".uzhnaq-svmtds-container")),
      legalItems,
    };
  }

  function buildFooterItemMarkup(item, extraClass = "") {
    const icon = inlineFooterIcons[item.icon] || inlineFooterIcons.world;
    const content = item.href
      ? `<a class="site-footer-item-link" href="${escapeAttribute(item.href)}"${item.external ? ' target="_blank" rel="noopener"' : ""}>${escapeHtml(item.label)}</a>`
      : `<span class="site-footer-item-text">${escapeHtml(item.label)}</span>`;

    return `
      <div class="site-footer-item ${extraClass}">
        <span class="site-footer-icon" aria-hidden="true">${icon}</span>
        <div class="site-footer-item-copy">${content}</div>
      </div>
    `;
  }

  function buildFooterShell(data) {
    const shell = document.createElement("section");
    shell.className = "site-footer-shell";
    shell.innerHTML = `
      <div class="site-footer-bg" aria-hidden="true">
        <img class="site-footer-blueprint" src="${escapeAttribute(footerBlueprintAsset)}" alt="">
        <img class="site-footer-gear-overlay" src="${escapeAttribute(footerGearOverlayAsset)}" alt="">
      </div>
      <div class="site-footer-inner">
        <div class="site-footer-headline-row">
          <h2 class="site-footer-headline">${escapeHtml(data.headline)}</h2>
        </div>
        <div class="site-footer-main">
          <section class="site-footer-section site-footer-contact-panel">
            <h3 class="site-footer-section-title">Contact</h3>
            <div class="site-footer-item-list">
              ${data.contactItems.map((item) => buildFooterItemMarkup(item, "is-contact")).join("")}
            </div>
          </section>
          <section class="site-footer-section site-footer-social-panel">
            <h3 class="site-footer-section-title">Follow Us</h3>
            <div class="site-footer-item-list">
              ${data.socialItems.map((item) => buildFooterItemMarkup(item, "is-social")).join("")}
            </div>
          </section>
          <section class="site-footer-newsletter-card">
            <h3 class="site-footer-newsletter-title">${escapeHtml(data.newsletterTitle)}</h3>
            <p class="site-footer-newsletter-copy">${escapeHtml(data.newsletterCopy)}</p>
            <div class="site-footer-newsletter-form-slot"></div>
          </section>
        </div>
        <div class="site-footer-legal">
          ${data.legalItems.map((item) => `<span class="site-footer-legal-item">${escapeHtml(item)}</span>`).join("")}
        </div>
      </div>
    `;

    const formSlot = shell.querySelector(".site-footer-newsletter-form-slot");
    if (formSlot instanceof HTMLElement && data.newsletterForm instanceof HTMLElement) {
      formSlot.appendChild(data.newsletterForm);
    }

    if (!data.contactItems.length) {
      shell.querySelector(".site-footer-contact-panel")?.remove();
    }

    if (!data.socialItems.length) {
      shell.querySelector(".site-footer-social-panel")?.remove();
    }

    if (!data.legalItems.length) {
      shell.querySelector(".site-footer-legal")?.remove();
    }

    return shell;
  }

  function hideFooterSourceNodes(root) {
    root
      .querySelectorAll(
        '[data-uzhnaq-background-image-wrapper="true"], .uzhnaq-1r1llpm, .uzhnaq-1d0rkid, .uzhnaq-hashds, .uzhnaq-l3ry8h, .uzhnaq-48xil1, .uzhnaq-1jupf1z',
      )
      .forEach((node) => {
        if (node instanceof HTMLElement) {
          node.classList.add("footer-source-hidden");
        }
      });
  }

  function initializeFooterEnhancements() {
    document.querySelectorAll(".uzhnaq-1jtqeum").forEach((footerRoot) => {
      if (
        !(footerRoot instanceof HTMLElement) ||
        footerRoot.dataset.footerShellReady === "true" ||
        !footerRoot.querySelector(".uzhnaq-1d0rkid") ||
        !footerRoot.querySelector(".uzhnaq-l3ry8h")
      ) {
        return;
      }

      const footerData = collectFooterData(footerRoot);
      const footerShell = buildFooterShell(footerData);

      footerRoot.dataset.footerShellReady = "true";
      footerRoot.parentElement?.classList.add("site-footer-wrapper");
      footerRoot.classList.add("footer-live-root", "site-footer-mounted");
      footerRoot.appendChild(footerShell);
      hideFooterSourceNodes(footerRoot);
    });
  }

  

  function buildYouTubeEmbed(title) {
    const fallbackNote = isFileProtocol
      ? `
        <div class="yt-local-note">
          Embedded YouTube playback can be blocked when opening the site directly from your computer. If that happens, run the site through a local server.
        </div>
      `
      : "";

    return `
      <div class="yt-embed-shell">
        <iframe
          class="yt-embed-frame"
          src="${youtubeEmbedUrl}"
          title="${escapeAttribute(title)}"
          loading="eager"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="origin"
          allowfullscreen
        ></iframe>
        ${fallbackNote}
      </div>
    `;
  }

  function getVisibleRoot() {
    return document.querySelector("[data-uzhnaq-root]") || document.getElementById("main") || document.body;
  }

  function getDirectChild(root, descendant) {
    let current = descendant;
    while (current && current.parentElement && current.parentElement !== root) {
      current = current.parentElement;
    }
    return current && current.parentElement === root ? current : null;
  }

  function decorateHeaderNavigation() {
    document.querySelectorAll('nav[data-uzhnaq-name] [data-uzhnaq-name="Links"] a.uzhnaq-text').forEach((link) => {
      link.classList.add("site-nav-link");
      const shell =
        link.closest('[data-uzhnaq-name="Inline Link"]') ||
        link.closest('[data-uzhnaq-component-type="RichTextContainer"]');
      shell?.classList.add("site-nav-item-shell");
    });

    Object.values(dropdownGroups).forEach((config) => {
      document.querySelectorAll(`[id="${config.triggerId}"]`).forEach((trigger) => {
        trigger.classList.add("site-nav-trigger", "site-nav-item-shell");
      });
    });
  }

  function highlightActiveLinks() {
    document.querySelectorAll("a.uzhnaq-text").forEach((link) => {
      const href = (link.getAttribute("href") || "").replace(/^\.\//, "");
      if (link.getAttribute("data-uzhnaq-page-link-current") === "true" || href === currentPath) {
        link.classList.add("active-uzhnaq-link");
        link.classList.add("site-nav-current");
        link.closest(".site-nav-item-shell")?.classList.add("site-nav-current");
      }
    });

    const triggerHighlightMap = {
      "about.html": "undefined-1njxbrf",
      "products.html": "undefined-14p26ei",
    };
    const activeTriggerId = triggerHighlightMap[currentPath];
    if (!activeTriggerId) {
      return;
    }

    document.querySelectorAll(`[id="${activeTriggerId}"]`).forEach((trigger) => {
      trigger.classList.add("active-uzhnaq-link");
      trigger.classList.add("site-nav-current");
      trigger.querySelectorAll(".uzhnaq-text").forEach((node) => {
        node.classList.add("active-uzhnaq-link");
      });
    });
  }

  function initializeDropdowns() {
    Object.entries(dropdownGroups).forEach(([label, config]) => {
      document.querySelectorAll(`[id="${config.triggerId}"]`).forEach((trigger) => {
        if (trigger.dataset.dropdownReady === "true") {
          return;
        }

        trigger.dataset.dropdownReady = "true";
        trigger.classList.add("has-premium-dropdown");
        trigger.setAttribute("tabindex", "0");
        trigger.setAttribute("role", "button");
        trigger.setAttribute("aria-haspopup", "true");
        trigger.setAttribute("aria-expanded", "false");

        const dropdown = document.createElement("div");
        dropdown.className = "premium-dropdown";
        dropdown.dataset.placement = "bottom";
        dropdown.innerHTML = `
          <div class="dropdown-header">
            <span class="dropdown-eyebrow">${label}</span>
            <p class="dropdown-lead">${config.lead}</p>
          </div>
          <ul class="dropdown-list">
            ${config.items
              .map(
                (item) => `
                  <li>
                    <a href="${item.href}" class="dropdown-item">
                      <span class="dropdown-item-copy">
                        <span class="dropdown-item-title">${item.title}</span>
                        <span class="dropdown-item-subtitle">${item.subtitle}</span>
                      </span>
                      <span class="dropdown-item-arrow" aria-hidden="true">&#8594;</span>
                    </a>
                  </li>
                `,
              )
              .join("")}
          </ul>
        `;

        document.body.appendChild(dropdown);

        const positionDropdown = () => {
          const rect = trigger.getBoundingClientRect();
          const dropdownWidth = dropdown.offsetWidth || 320;
          const dropdownHeight = dropdown.offsetHeight || 260;
          const maxLeft = window.innerWidth - dropdownWidth - 12;
          const centeredLeft = rect.left + rect.width / 2 - dropdownWidth / 2;
          const left = Math.min(Math.max(12, centeredLeft), Math.max(12, maxLeft));
          const preferredTop = rect.bottom + 4;
          const fitsBelow = preferredTop + dropdownHeight < window.innerHeight - 12;
          const top = fitsBelow ? preferredTop : Math.max(12, rect.top - dropdownHeight - 10);

          dropdown.style.left = `${left}px`;
          dropdown.style.top = `${top}px`;
          dropdown.dataset.placement = fitsBelow ? "bottom" : "top";
        };

        const showDropdown = () => {
          dropdown.classList.add("visible");
          trigger.setAttribute("aria-expanded", "true");
          positionDropdown();
        };

        const hideDropdownNow = () => {
          dropdown.classList.remove("visible");
          trigger.setAttribute("aria-expanded", "false");
        };

        const hideDropdown = () => {
          hideDropdownNow();
        };

        if (prefersHover) {
          trigger.addEventListener("pointerenter", showDropdown);
          trigger.addEventListener("pointerleave", hideDropdown);
          dropdown.addEventListener("pointerenter", showDropdown);
          dropdown.addEventListener("pointerleave", hideDropdown);
        }

        trigger.addEventListener("focusin", showDropdown);
        trigger.addEventListener("focusout", hideDropdown);
        trigger.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            if (dropdown.classList.contains("visible")) {
              hideDropdownNow();
            } else {
              showDropdown();
            }
          }

          if (event.key === "Escape") {
            hideDropdownNow();
          }
        });

        trigger.addEventListener("click", (event) => {
          if (prefersHover) {
            return;
          }

          event.preventDefault();
          if (dropdown.classList.contains("visible")) {
            hideDropdownNow();
          } else {
            showDropdown();
          }
        });

        document.addEventListener("click", (event) => {
          if (!dropdown.contains(event.target) && !trigger.contains(event.target)) {
            hideDropdownNow();
          }
        });

        window.addEventListener("resize", () => {
          if (dropdown.classList.contains("visible")) {
            positionDropdown();
          }
        });

        window.addEventListener(
          "scroll",
          () => {
            if (dropdown.classList.contains("visible")) {
              positionDropdown();
            }
          },
          true,
        );
      });
    });
  }

  function resolveEnquiryEndpoint() {
    const configuredEndpoint =
      window.UZHNAQ_ENQUIRY_API ||
      document.querySelector('meta[name="uzhnaq-enquiry-api"]')?.getAttribute("content") ||
      document.documentElement?.getAttribute("data-uzhnaq-enquiry-api") ||
      document.body?.getAttribute("data-uzhnaq-enquiry-api") ||
      "";

    if (configuredEndpoint) {
      try {
        return new URL(configuredEndpoint, window.location.href).toString();
      } catch (_error) {
        return configuredEndpoint;
      }
    }

    if (isFileProtocol) {
      return "http://127.0.0.1:3001/api/enquiry";
    }

    if (pageOrigin) {
      try {
        return new URL("./api/enquiry", window.location.href).toString();
      } catch (_error) {
        return `${pageOrigin}/api/enquiry`;
      }
    }

    return "/api/enquiry";
  }

  function isEnquiryForm(form) {
    return (
      form instanceof HTMLFormElement &&
      Boolean(form.querySelector('input[name="Name"]:not([type="hidden"])')) &&
      Boolean(form.querySelector('input[name="Email"]:not([type="hidden"])')) &&
      Boolean(form.querySelector('textarea[name="Ask us anything!"]'))
    );
  }

  function getEnquiryFields(form) {
    return {
      name: form.querySelector('input[name="Name"]:not([type="hidden"])'),
      email: form.querySelector('input[name="Email"]:not([type="hidden"])'),
      message: form.querySelector('textarea[name="Ask us anything!"]'),
      phone:
        form.querySelector('input[name="Phone"]:not([type="hidden"])') ||
        form.querySelector('input[name="phone"]:not([type="hidden"])') ||
        form.querySelector('input[name="Telephone"]:not([type="hidden"])') ||
        form.querySelector('input[name="Mobile"]:not([type="hidden"])'),
      company:
        form.querySelector('input[name="Company"]:not([type="hidden"])') ||
        form.querySelector('input[name="company"]:not([type="hidden"])'),
      subject:
        form.querySelector('input[name="Subject"]:not([type="hidden"])') ||
        form.querySelector('input[name="subject"]:not([type="hidden"])'),
      preferredContact:
        form.querySelector('select[name="preferredContact"]') ||
        form.querySelector('input[name="preferredContact"]:checked') ||
        form.querySelector('input[name="Preferred Contact"]:checked'),
      honeypot:
        form.querySelector('input[name="website"]') ||
        form.querySelector('input[name="webSite"]') ||
        form.querySelector('input[name="companyWebsite"]') ||
        form.querySelector('input[name="urlField"]'),
      submit: form.querySelector('button[type="submit"], input[type="submit"]'),
    };
  }

  function createEnquiryStatus(form, submitControl) {
    const status = document.createElement("div");
    status.className = "enquiry-form-status";
    status.hidden = true;
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");

    if (submitControl?.parentElement && submitControl.parentElement !== form) {
      submitControl.parentElement.insertAdjacentElement("afterend", status);
      return status;
    }

    form.appendChild(status);
    return status;
  }

  function setEnquiryStatus(statusNode, tone, message) {
    statusNode.hidden = !message;
    statusNode.className = "enquiry-form-status";
    statusNode.textContent = message || "";

    if (!message) {
      return;
    }

    statusNode.classList.add("is-visible", `is-${tone}`);
  }

  function clearEnquiryErrors(fields) {
    Object.values(fields).forEach((field) => {
      if (!(field instanceof HTMLElement)) {
        return;
      }

      field.removeAttribute("data-enquiry-invalid");
      field.removeAttribute("aria-invalid");
    });
  }

  function applyEnquiryErrors(fields, errors = {}) {
    Object.entries(errors).forEach(([fieldName]) => {
      const field = fields[fieldName];
      if (!(field instanceof HTMLElement)) {
        return;
      }

      field.setAttribute("data-enquiry-invalid", "true");
      field.setAttribute("aria-invalid", "true");
    });
  }

  function setEnquirySubmitting(form, submitControl, isSubmitting) {
    form.dataset.enquiryLoading = String(isSubmitting);

    if (!(submitControl instanceof HTMLElement)) {
      return;
    }

    submitControl.toggleAttribute("disabled", isSubmitting);

    if (submitControl instanceof HTMLButtonElement) {
      submitControl.dataset.defaultLabel ||= submitControl.textContent?.trim() || "Submit";
      submitControl.textContent = isSubmitting ? "Sending..." : submitControl.dataset.defaultLabel;
      return;
    }

    if (submitControl instanceof HTMLInputElement) {
      submitControl.dataset.defaultLabel ||= submitControl.value || "Submit";
      submitControl.value = isSubmitting ? "Sending..." : submitControl.dataset.defaultLabel;
    }
  }

  function readFieldValue(field) {
    if (
      field instanceof HTMLInputElement ||
      field instanceof HTMLTextAreaElement ||
      field instanceof HTMLSelectElement
    ) {
      return field.value.trim();
    }

    return "";
  }

  function buildEnquiryPayload(fields) {
    return {
      name: readFieldValue(fields.name),
      email: readFieldValue(fields.email),
      phone: readFieldValue(fields.phone),
      company: readFieldValue(fields.company),
      subject: readFieldValue(fields.subject) || `Website enquiry from ${currentPath}`,
      message: readFieldValue(fields.message),
      page: window.location.href || currentPath,
      preferredContact: readFieldValue(fields.preferredContact) || "Email",
      website: readFieldValue(fields.honeypot),
    };
  }

  async function parseResponseBody(response) {
    const responseText = await response.text();
    if (!responseText) {
      return null;
    }

    try {
      return JSON.parse(responseText);
    } catch (_error) {
      return null;
    }
  }

  function getErrorSummary(message, errors = {}) {
    const firstFieldMessage = Object.values(errors).find(Boolean);
    return firstFieldMessage || message || "Please review the enquiry form and try again.";
  }

  function initializeEnquiryForms() {
    const endpoint = resolveEnquiryEndpoint();
    document.querySelectorAll("form").forEach((form) => {
      if (!isEnquiryForm(form) || form.dataset.enquiryReady === "true") {
        return;
      }

      form.dataset.enquiryReady = "true";
      form.setAttribute("novalidate", "true");

      const fields = getEnquiryFields(form);
      const statusNode = createEnquiryStatus(form, fields.submit);

      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        clearEnquiryErrors(fields);
        setEnquiryStatus(statusNode, "pending", "Sending your enquiry...");
        setEnquirySubmitting(form, fields.submit, true);

        try {
          const response = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(buildEnquiryPayload(fields)),
          });

          const data = await parseResponseBody(response);

          if (!response.ok || !data?.ok) {
            const errors = data?.errors || {};
            applyEnquiryErrors(fields, errors);
            setEnquiryStatus(statusNode, "error", getErrorSummary(data?.message, errors));
            return;
          }

          form.reset();
          clearEnquiryErrors(fields);
          setEnquiryStatus(statusNode, "success", data.message || "Enquiry sent successfully.");
        } catch (_error) {
          const fallbackMessage = isFileProtocol
            ? "The enquiry backend is not reachable. Start the server and try again."
            : "Unable to send your enquiry right now. Please try again shortly.";
          setEnquiryStatus(statusNode, "error", fallbackMessage);
        } finally {
          setEnquirySubmitting(form, fields.submit, false);
        }
      });
    });
  }

  

  

  

  

  

  

  
});
