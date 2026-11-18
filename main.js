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

const workList = document.querySelector("#work-gallery");
if (workList) {
  portfolio.projects.forEach((project, index) => {
    const card = document.createElement("article");
    card.className = "work-card";
    card.dataset.category = project.category;
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
    title.textContent = project.title;
    const description = document.createElement("p");
    description.textContent = project.description;
    const status = document.createElement("span");
    status.className = "card-status";
    status.textContent = project.status;
    const copy = document.createElement("div");
    copy.className = "work-copy";
    copy.append(meta, title, status, description);
    project.workOverview.forEach((detail) => {
      const paragraph = document.createElement("p");
      paragraph.textContent = detail;
      copy.append(paragraph);
    });
    if (project.url) {
      const link = document.createElement("a");
      link.className = "text-link";
      link.href = project.url;
      link.textContent = `Visit ${project.title} ↗`;
      copy.append(link);
    }
    card.append(image, copy);
    workList.append(card);
  });
  const count = portfolio.projects.length;
  document.querySelector("#work-count").textContent = String(count).padStart(2, "0");
  document.querySelector("#work-status").textContent =
    `${count} ${count === 1 ? "entry" : "entries"} / Includes disclosed AI assistance`;
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
    const title = document.querySelector("#case-title");
    title.textContent = project.title;
    if (id === "cloud-portfolio") title.dataset.splitTitle = "";
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
          ...(project.architecture ? [["Architecture", project.architecture]] : []),
          ["Decisions", project.decisions],
          ["Implementation", project.implementation],
        ];
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


// Keep project content and controls available if the optional motion bundle fails.
const splitTitle = document.querySelector("[data-split-title]");
if ((workList || splitTitle) && !reducedMotion()) {
  import("./assets/portfolio-motion.js")
    .then(({ initMotion }) => initMotion({ homepage: Boolean(workList), splitTitle }))
    .catch(() => {});
}
