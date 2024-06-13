document.getElementById('openTabs').addEventListener('click', () => {
  console.log("in popup");

  // Get the number of tabs to open from the input field
  const numTabs = document.getElementById('numTabs').value;

  if (!numTabs || numTabs < 1) {
    alert('Please enter a valid number of minutes');
    return;
  }
  if (numTabs > 100) {
    alert('The maximum 100 minutes BackTest at a same time');
    return;
  }

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    console.log("in  popup with current window");
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      files: ['content.js']
    }, () => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'triggerFunction',numTabs: parseInt(numTabs, 10)});
    });
  });

});

