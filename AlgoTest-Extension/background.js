// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   if (request.action === 'triggerFunction' && request.times) {
//     chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//       if (tabs[0].id) {
//         chrome.tabs.sendMessage(tabs[0].id, { action: 'triggerFunction', times: request.times });
//       }
//     });
//   }
//   sendResponse({ status: 'received' });
// });

// console.log("in background");