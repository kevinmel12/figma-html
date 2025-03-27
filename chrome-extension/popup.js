document.getElementById('captureBtn').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: injectScript
    });
  });
  
  // Function to be injected into the page
  function injectScript() {
    
    // Fonction permettant d'extraire des métadonnées supplémentaires
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
          isHovered: false, 
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
  
    // Capture the full page with metadata
    const domWithMetadata = captureDOMWithMetadata(document.body);
    

    const enrichedData = {
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
  
    console.log("Page capturée :", enrichedData);
    
    chrome.runtime.sendMessage({ 
      action: 'capturedData', 
      data: enrichedData 
    });
  }