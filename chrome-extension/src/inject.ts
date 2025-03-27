import { htmlToFigma } from "@builder.io/html-to-figma";

// Function for extracting additional metadata
function extractMetadata(element) {
  const metadata = {
    id: element.id || '',
    classes: Array.from(element.classList || []),
    tagName: element.tagName,
    attributes: {},
    accessibilityInfo: {
      role: element.getAttribute('role') || null,
      ariaLabel: element.getAttribute('aria-label') || null,
      ariaHidden: element.getAttribute('aria-hidden') || null,
      tabIndex: element.getAttribute('tabIndex') || null,
    },
    state: {
      isActive: document.activeElement === element,
      isHovered: false, // Difficult to determine statically
      isDisabled: element.disabled || element.getAttribute('aria-disabled') === 'true',
    },
    hierarchy: {
      parent: element.parentElement ? {
        id: element.parentElement.id || '',
        tagName: element.parentElement.tagName,
      } : null,
      childrenCount: element.children.length,
    }
  };

  // Extract all attributes
  for (let i = 0; i < element.attributes.length; i++) {
    const attr = element.attributes[i];
    metadata.attributes[attr.name] = attr.value;
  }
  
  return metadata;
}

// Recursive DOM capture with metadata
function captureDOMWithMetadata(element) {
  const result = {
    element: element,
    metadata: extractMetadata(element),
    children: []
  };

  for (let i = 0; i < element.children.length; i++) {
    result.children.push(captureDOMWithMetadata(element.children[i]));
  }

  return result;
}

// Capture the full page with additional metadata
const domWithMetadata = captureDOMWithMetadata(document.body);

// Use html-to-figma to extract layers
const layers = htmlToFigma("body", location.hash.includes("useFrames=true"));

// Merge metadata with layers
const enrichedData = {
  layers,
  metadata: domWithMetadata,
  pageInfo: {
    title: document.title,
    url: window.location.href,
    timestamp: new Date().toISOString(),
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio
    }
  }
};

var json = JSON.stringify(enrichedData);

var blob = new Blob([json], {
  type: "application/json",
});

const link = document.createElement("a");
link.setAttribute("href", URL.createObjectURL(blob));
link.setAttribute("download", "page.figma.json");
document.body.appendChild(link);
link.click();
document.body.removeChild(link);