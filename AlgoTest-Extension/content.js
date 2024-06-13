// Event listener for messages received from other windows or frames
window.addEventListener('message', (event) => {
  // Ensure the message is from the same origin to prevent security risks
  if (event.origin !== window.location.origin) {
    return;
  }

  // Destructure the data received from the message event
  const { action, time, action1, Strategy_Name, action2, action3, StartDate, EndDate } = event.data;

  // Handle action to select the strategy based on the strategy name received
  if (action1 === "Strategy") {
    let allStrategies = document.getElementsByTagName("li");

    for (let i of allStrategies) {
      // Match strategy name exactly or partially if it ends with "..."
      if (i.textContent.trim() === Strategy_Name || i.textContent.trim() === `${Strategy_Name}...`) {
        i.click(); // Simulate a click on the matched strategy element
        break;
      }
    }
  }

  // Handle action to update the start date
  if (action2 === "updateStartDate") {
    const startDateInput = document.querySelectorAll('input[type="Date"]')[0];
    if (startDateInput) {
      startDateInput.value = StartDate;
    }
  }

  // Handle action to update the end date
  if (action3 === "updateEndDate") {
    const endDateInput = document.querySelectorAll('input[type="Date"]')[1];
    if (endDateInput) {
      endDateInput.value = EndDate;
    }
    b = document.body.getElementsByClassName("border-green-600 bg-green-600")[0]
    b.click();
  }

  // Handle action to update the time input field
  if (action === 'updateTime') {
    const timeInput = document.querySelector('input[type="time"]');
    if (timeInput) {
      timeInput.value = time;
    }
  }
}, false);

// Listener for messages from the background script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'triggerFunction') {
    // Add tasks to the queue and start processing them
    console.log("onMessage", message.numTabs);
    callAbcMultipleTimes(message.numTabs); // Call the function multiple times as specified
  }
});

// Queue to manage tasks and ensure sequential processing
let queue = [];
let processing = false;

// Function to add tasks to the queue
async function callAbcMultipleTimes(times) {
  for (let i = 0; i < times; i++) {
    // Push a new task into the queue
    queue.push(() => fun(i));
  }
  // Start processing the queue
  processQueue();
}

// Function to process the queue one task at a time
async function processQueue() {
  if (processing) return; // If already processing, do nothing
  processing = true;

  // Process tasks in the queue sequentially
  while (queue.length > 0) {
    const task = queue.shift(); // Get the next task from the queue
    await task(); // Wait for the task to complete
  }

  processing = false; // Reset processing flag
}

// Function to be called for each task in the queue
async function fun(i) {
  try {
    // Select the time and date input elements
    const timeInput = document.querySelector('input[type="time"]');
    const dateInputs = document.querySelectorAll('input[type="date"]');

    // Convert the current time to seconds, add 60 seconds, and convert back to time string
    let seconds = getTimeInSeconds(timeInput.value);
    seconds += 60;
    const timeInString = getTime(seconds);
    timeInput.value = timeInString;

    // Get the strategy name from the page
    const strategyNameElement = document.getElementById("strategy-header");
    const strategyName = strategyNameElement.textContent.trim();

    // Open a new tab and navigate to the specified URL
    const newTab = window.open("https://algotest.in/backtest", "_blank");

    if (!newTab) {
      throw new Error("Popup blocked");
    }

    // Create a promise to wait for the new tab to fully load
    const tabLoaded = new Promise(resolve => {
      newTab.onload = resolve;
    });

    await tabLoaded; // Wait for the new tab to fully load

    // Send data to the new tab to set the strategy, time, start date, and end date
    newTab.postMessage({ action1: 'Strategy', Strategy_Name: strategyName }, "*");
    setTimeout(() => {
      newTab.postMessage({ action: 'updateTime', time: timeInString }, "*");
      newTab.postMessage({ action2: 'updateStartDate', StartDate: dateInputs[0].value }, "*");
      newTab.postMessage({ action3: 'updateEndDate', EndDate: dateInputs[1].value }, "*");
    }, 1000);

    // Wait for a short duration before continuing to the next task
    await new Promise(resolve => setTimeout(resolve, 1900));

  } catch (error) {
    console.error("Error occurred in fun function:", error);
  }
}

// Utility function to convert time string to seconds
function getTimeInSeconds(timeInputValue) {
  const [hours, minutes] = timeInputValue.split(':').map(Number);
  return hours * 3600 + minutes * 60;
}

// Utility function to convert seconds to time string
function getTime(timeInSeconds) {
  const hours = Math.floor(timeInSeconds / 3600).toString().padStart(2, '0');
  const minutes = Math.floor((timeInSeconds % 3600) / 60).toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}
