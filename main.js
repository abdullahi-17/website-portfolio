const reducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Only create active links when a real destination has been supplied.
function contactItem(label, destination, email = false) {
  const element = document.createElement(destination ? "a" : "span");
  element.textContent = destination ? `${label} ↗` : `${label} — to add`;
  if (destination) element.href = email ? `mailto:${destination}` : destination;
  else element.className = "unavailable";
  return element;
}

document.querySelectorAll("[data-resume]").forEach((slot) => {
  slot.append(contactItem("Résumé", portfolio.contact.resume));
});
const contacts = document.querySelector("#contact-links");
if (contacts) {
  [
    ["Email", "email"],
    ["LinkedIn", "linkedin"],
    ["GitHub", "github"],
    ["Résumé", "resume"],
  ].forEach(([label, key]) => {
    const item = document.createElement("li");
    item.append(contactItem(label, portfolio.contact[key], key === "email"));
    contacts.append(item);
  });
}

const gallery = document.querySelector("#work-gallery");
if (gallery) {
  portfolio.projects.forEach((project, index) => {
    const card = document.createElement("article");
    card.className = "work-card";
    card.dataset.category = project.category;
    const link = document.createElement("a");
    link.href =
      project.url || `project.html?id=${encodeURIComponent(project.id)}`;
    const image = document.createElement("img");
    Object.assign(image, {
      src: project.image,
      alt: project.imageAlt,
      width: 800,
      height: 1000,
      loading: "lazy",
      decoding: "async",
    });
    if (project.imageClass) image.classList.add(project.imageClass);
    const meta = document.createElement("div");
    meta.className = "card-meta micro";
    const category = document.createElement("span");
    category.textContent = project.categoryLabel;
    const number = document.createElement("span");
    number.textContent = String(index + 1).padStart(2, "0");
    meta.append(category, number);
    const title = document.createElement("h3");
    title.textContent = `${project.title} ↗`;
    const description = document.createElement("p");
    description.textContent = project.description;
    const status = document.createElement("span");
    status.className = "card-status";
    status.textContent = project.status;
    link.append(image, meta, title, description, status);
    card.append(link);
    gallery.append(card);
  });
  const arrows = [...document.querySelectorAll("[data-scroll]")];
  function updateArrows() {
    arrows.forEach((button) => {
      button.disabled =
        Number(button.dataset.scroll) < 0
          ? gallery.scrollLeft < 2
          : gallery.scrollLeft >= gallery.scrollWidth - gallery.clientWidth - 2;
    });
  }
  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      document
        .querySelectorAll("[data-filter]")
        .forEach((item) =>
          item.setAttribute("aria-pressed", String(item === button)),
        );
      gallery.querySelectorAll(".work-card").forEach((card) => {
        card.hidden =
          button.dataset.filter !== "all" &&
          card.dataset.category !== button.dataset.filter;
      });
      gallery.scrollLeft = 0;
      updateCount();
      updateArrows();
    });
  });
  function updateCount() {
    const count = gallery.querySelectorAll(".work-card:not([hidden])").length;
    document.querySelector("#work-count").textContent = String(count).padStart(
      2,
      "0",
    );
    document.querySelector("#work-status").textContent =
      `${count} ${count === 1 ? "entry" : "entries"} / Includes planned work and disclosed AI assistance`;
  }
  function scrollGallery(direction) {
    const card = gallery.querySelector(".work-card:not([hidden])");
    if (!card) return;
    const gap = parseFloat(getComputedStyle(gallery).gap);
    gallery.scrollBy({
      left: direction * (card.getBoundingClientRect().width + gap),
      behavior: reducedMotion() ? "instant" : "smooth",
    });
  }
  arrows.forEach((button) =>
    button.addEventListener("click", () =>
      scrollGallery(Number(button.dataset.scroll)),
    ),
  );
  gallery.addEventListener("keydown", (event) => {
    if (
      event.target !== gallery ||
      !["ArrowLeft", "ArrowRight"].includes(event.key)
    )
      return;
    event.preventDefault();
    scrollGallery(event.key === "ArrowRight" ? 1 : -1);
  });
  gallery.addEventListener("scroll", updateArrows, { passive: true });
  window.addEventListener("resize", updateArrows);
  updateCount();
  updateArrows();
}

const casePage = document.querySelector("#case-content");
if (casePage) {
  const id =
    new URLSearchParams(location.search).get("id") || "cloud-portfolio";
  const project = portfolio.projects.find((item) => item.id === id);
  if (!project) {
    document.querySelector("#case-title").textContent = "Project not found";
    document.querySelector("#case-summary").textContent =
      "Return to selected work to choose an available project.";
  } else {
    document.title = `${project.title} — Abdullahi Omer`;
    document.querySelector("#case-title").textContent = project.title;
    document.querySelector("#case-category").textContent =
      `${project.categoryLabel} / ${project.status}`;
    document.querySelector("#case-summary").textContent = project.description;
    const image = document.querySelector("#case-image");
    Object.assign(image, { src: project.image, alt: project.imageAlt });
    image.hidden = false;
    if (project.imageClass) image.classList.add(project.imageClass);
    const sections = project.sections
      ? [...project.sections]
      : [
          ["The problem", project.problem],
          ["My contribution", project.contribution],
          [
            "Tools",
            project.tools.length
              ? project.tools.join(" / ")
              : "To add: tools actually used in this project.",
          ],
          ["Decisions", project.decisions],
          ["Implementation", project.implementation],
        ];
    if (!project.sections && project.architecture)
      sections.push(["Architecture", project.architecture]);
    if (project.architectureNote)
      sections.push(["DNS & certificate", project.architectureNote]);
    if (project.deployment) sections.push(["Deployment", project.deployment]);
    if (project.extraSections) sections.push(...project.extraSections);
    if (project.lessons) sections.push(["Lessons learned", project.lessons]);
    sections.forEach(([heading, content]) => {
      const section = document.createElement("section");
      section.className = "case-section";
      const title = document.createElement("h2");
      title.textContent = heading;
      const body = document.createElement(Array.isArray(content) ? "ol" : "p");
      if (Array.isArray(content)) {
        body.className = "architecture";
        body.setAttribute(
          "aria-label",
          project.architectureLabel ||
            "Request flow from browser to static files",
        );
        content.forEach((step) => {
          const item = document.createElement("li");
          item.textContent = step;
          body.append(item);
        });
      } else body.textContent = content;
      section.append(title, body);
      casePage.append(section);
    });
    const links = document.createElement("div");
    links.className = "project-links";
    const source = contactItem("GitHub source", project.github);
    const demo = contactItem("Live demo", project.demo);
    if (!project.github && project.sourceNote)
      source.textContent = project.sourceNote;
    if (!project.demo && project.demoNote) demo.textContent = project.demoNote;
    links.append(source, demo);
    casePage.append(links);
    if (project.references) {
      const references = document.createElement("section");
      references.className = "case-section";
      const heading = document.createElement("h2");
      heading.textContent = "References";
      const list = document.createElement("ul");
      list.className = "case-references";
      project.references.forEach(([label, url]) => {
        const item = document.createElement("li");
        const link = document.createElement("a");
        link.textContent = label;
        link.href = url;
        item.append(link);
        list.append(item);
      });
      references.append(heading, list);
      casePage.append(references);
    }
  }
}

// Hover reveals the full set; the button provides the same action by touch or keyboard.
const imageStack = document.querySelector(".image-stack");
if (imageStack) {
  const toggle = imageStack.querySelector(".stack-toggle");
  const hint = toggle.querySelector(".stack-hint");
  function expandImages(expanded) {
    imageStack.classList.toggle("is-expanded", expanded);
    toggle.setAttribute("aria-expanded", String(expanded));
    toggle.setAttribute(
      "aria-label",
      expanded ? "Collapse image stack" : "Expand all five images",
    );
    hint.textContent = expanded ? "Close images ↙" : "Explore images ↗";
  }
  imageStack.addEventListener("pointerenter", (event) => {
    if (event.pointerType !== "touch" && matchMedia("(hover: hover)").matches)
      expandImages(true);
  });
  imageStack.addEventListener("pointerleave", (event) => {
    if (event.pointerType !== "touch") expandImages(false);
  });
  toggle.addEventListener("click", () =>
    expandImages(toggle.getAttribute("aria-expanded") !== "true"),
  );
  imageStack.addEventListener("focusout", (event) => {
    if (!imageStack.contains(event.relatedTarget)) expandImages(false);
  });
  imageStack.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      expandImages(false);
      event.preventDefault();
    }
  });
  document.addEventListener("pointerdown", (event) => {
    if (!imageStack.contains(event.target)) expandImages(false);
  });
}
