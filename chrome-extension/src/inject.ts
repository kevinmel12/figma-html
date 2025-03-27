import { htmlToFigma } from "@builder.io/html-to-figma";

// Define interfaces for typing
interface Metadata {
  id: string;
  classes: string[];
  tagName: string;
  attributes: Record<string, string>;
  accessibilityInfo: {
    role: string | null;
    ariaLabel: string | null;
    ariaHidden: string | null;
    tabIndex: string | null;
  };
  state: {
    isActive: boolean;
    isHovered: boolean;
    isDisabled: boolean;
  };
  hierarchy: {
    parent: {
      id: string;
      tagName: string;
    } | null;
    childrenCount: number;
  };
}

interface DOMWithMetadata {
  element: HTMLElement;
  metadata: Metadata;
  children: DOMWithMetadata[];
}

// Function for extracting additional metadata
function extractMetadata(element: HTMLElement): Metadata {
  const metadata: Metadata = {
    id: element.id || '',
    classes: Array.from(element.classList || []),
    tagName: element.tagName,
    attributes: {},
    accessibilityInfo: {
      role: element.getAttribute('role'),
      ariaLabel: element.getAttribute('aria-label'),
      ariaHidden: element.getAttribute('aria-hidden'),
      tabIndex: element.getAttribute('tabIndex'),
    },
    state: {
      isActive: document.activeElement === element,
      isHovered: false,
      isDisabled: element.hasAttribute('disabled') || element.getAttribute('aria-disabled') === 'true',
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
function captureDOMWithMetadata(element: HTMLElement): DOMWithMetadata {
  const result: DOMWithMetadata = {
    element: element,
    metadata: extractMetadata(element),
    children: []
  };

  for (let i = 0; i < element.children.length; i++) {
    result.children.push(captureDOMWithMetadata(element.children[i] as HTMLElement));
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

const json = JSON.stringify(enrichedData);
const blob = new Blob([json], { type: "application/json" });
const link = document.createElement("a");
link.setAttribute("href", URL.createObjectURL(blob));
link.setAttribute("download", "page.figma.json");
document.body.appendChild(link);
link.click();
document.body.removeChild(link);