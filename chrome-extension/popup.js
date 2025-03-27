document.getElementById('captureBtn').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: () => {
        // Votre code d'extraction ici
        import { htmlToFigma } from "@builder.io/html-to-figma";
        
        // Function for extracting additional metadata
        function extractMetadata(element) {
          // ... votre code existant ...
        }
  
        // ... reste de votre code ...
      }
    });
  });