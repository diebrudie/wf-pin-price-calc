import noUiSlider from "nouislider";

// Initializing a slider
let sliderPinnedFile = document.getElementById("sliderPinnedFile");
let sliderStorage = document.getElementById("sliderStorage");
let sliderGateways = document.getElementById("sliderGateways");
let sliderBandwidth = document.getElementById("sliderBandwidth");
let sliderRequests = document.getElementById("sliderRequests");
// Default to 'Picnic' on load
let currentPlan = "Picnic";

// Function to create a slider
function createIntegerSlider(
  sliderElement,
  startValue,
  stepValue,
  minValue,
  maxValue
) {
  noUiSlider.create(sliderElement, {
    start: [startValue],
    step: stepValue,
    connect: [true, false],
    range: {
      min: [minValue],
      max: [maxValue]
    },
    tooltips: {
      to: function (value) {
        return Math.round(value).toLocaleString("en-US");
      }
    },
    format: {
      to: function (value) {
        return Math.round(value).toString();
      },
      from: function (value) {
        return Math.round(value);
      }
    }
  });

  //shows/hides the tooltip only when user interacts with the slider
  sliderElement.noUiSlider.on("start", () => {
    sliderElement.querySelector(".noUi-tooltip").style.display = "block";
  });
  sliderElement.noUiSlider.on("end", () => {
    sliderElement.querySelector(".noUi-tooltip").style.display = "none";
  });
}

// Initialize all sliders with the specified configurations
createIntegerSlider(sliderPinnedFile, 20000, 10000, 20000, 220000);
createIntegerSlider(sliderStorage, 500, 500, 500, 10000);
createIntegerSlider(sliderGateways, 1, 1, 1, 11);
createIntegerSlider(sliderBandwidth, 500, 500, 500, 7500);
createIntegerSlider(sliderRequests, 1000000, 1000000, 1000000, 10000000);

// Calculate Marker position for each slider
updateMarkerPosition(
  "sliderPinnedFile",
  "markerPinnedFile",
  100000,
  20000,
  220000
);
updateMarkerPosition("sliderStorage", "markerStorage", 2500, 500, 10000);
updateMarkerPosition("sliderGateways", "markerGateways", 3, 1, 11);
updateMarkerPosition("sliderBandwidth", "markerBandwidth", 2500, 500, 7500);
updateMarkerPosition(
  "sliderRequests",
  "markerRequests",
  5000000,
  1000000,
  10000000
);

// Update marker position on window resize
updateAllMarkers();
window.addEventListener("resize", updateAllMarkers);

// Format function for most sliders, adding commas for thousands
function formatWithCommas(value) {
  return Math.round(value).toLocaleString();
}

function formatRequests(value) {
  return (value / 1000000).toFixed(0) + "M";
}

// Function to update the pricing and displayed values
function updatePricing() {
  // Retrieve the values from the sliders
  const pinnedFilesValue = sliderPinnedFile.noUiSlider.get();
  const storageValue = sliderStorage.noUiSlider.get();
  const gatewaysValue = sliderGateways.noUiSlider.get();
  const bandwidthValue = sliderBandwidth.noUiSlider.get();
  const requestsValue = parseInt(sliderRequests.noUiSlider.get(), 10);

  // Convert to numbers for calculation purposes (removing any formatting)
  const numPinnedFilesValue = Number(pinnedFilesValue.replace(/,/g, ""));
  const numStorageValue = Number(storageValue.replace(/,/g, ""));
  const numGatewaysValue = Number(gatewaysValue.replace(/,/g, ""));
  const numBandwidthValue = Number(bandwidthValue.replace(/,/g, ""));
  //const numRequestsValue = Number(requestsValue.replace(/M/g, "")) * 1000000;

  // Calculate the costs using the numeric values
  const pricePinnedFiles = calculatePricePinnedFiles(numPinnedFilesValue);
  const priceStorage = calculatePriceStorage(numStorageValue);
  const priceGateways = calculatePriceGateways(numGatewaysValue);
  const priceBandwidth = calculatePriceBandwidth(numBandwidthValue);
  const priceRequests = calculatePriceRequests(requestsValue);

  // Now you can set the text content with formatted strings for display
  document.getElementById(
    "pricePinnedFiles"
  ).textContent = `$${formatWithCommas(pricePinnedFiles)}`;
  document.getElementById("priceStorage").textContent = `$${formatWithCommas(
    priceStorage
  )}`;
  document.getElementById("priceGateways").textContent = `$${formatWithCommas(
    priceGateways
  )}`;
  document.getElementById("priceBandwidth").textContent = `$${formatWithCommas(
    priceBandwidth
  )}`;
  document.getElementById(
    "priceRequests"
  ).textContent = `$${priceRequests.toLocaleString(undefined, {
    maximumFractionDigits: 0
  })}`;

  // Check each metric against the Fiesta Plan minimums and update message visibility
  showMessageForFiesta("minFiestaPinnedFiles", pinnedFilesValue, 100000);
  showMessageForFiesta("minFiestaStorage", storageValue, 2500);
  showMessageForFiesta("minFiestaGateways", gatewaysValue, 3);
  showMessageForFiesta("minFiestaBandwidth", bandwidthValue, 2500);
  showMessageForFiesta("minFiestaRequests", requestsValue, 5000000);

  // Set the base plan fee based on the current plan
  const pricePlanFee = currentPlan === "Picnic" ? 20 : 100;

  const priceTotal =
    pricePlanFee +
    pricePinnedFiles +
    priceStorage +
    priceGateways +
    priceBandwidth +
    priceRequests;

  document.getElementById(
    "priceTotal"
  ).textContent = `$${priceTotal.toLocaleString(undefined, {
    minimumFractionDigits: 0
  })}`;

  // Check if an upgrade recommendation is needed
  recommendPlanUpgrade(priceTotal);
}

// Event listeners for each slider to update the values and pricing
sliderPinnedFile.noUiSlider.on("update", updatePricing);
sliderStorage.noUiSlider.on("update", updatePricing);
sliderGateways.noUiSlider.on("update", updatePricing);
sliderBandwidth.noUiSlider.on("update", updatePricing);
sliderRequests.noUiSlider.on("update", updatePricing);

function calculatePricePinnedFiles(value) {
  let baseIncluded = currentPlan === "Picnic" ? 20000 : 100000;
  let extraFiles = value - baseIncluded;
  let costPerThousand = currentPlan === "Picnic" ? 0.2 : 0.15;
  return extraFiles > 0 ? (extraFiles / 1000) * costPerThousand : 0;
}

function calculatePriceStorage(value) {
  let baseIncluded = currentPlan === "Picnic" ? 500 : 2500;
  let extraStorage = value - baseIncluded;
  let costPerGB = currentPlan === "Picnic" ? 0.1 : 0.05;
  return extraStorage > 0 ? extraStorage * costPerGB : 0;
}

function calculatePriceGateways(value) {
  let includedGateways = currentPlan === "Picnic" ? 1 : 3;
  let price = value > includedGateways ? (value - includedGateways) * 5 : 0;
  return price;
}

function calculatePriceBandwidth(value) {
  let baseIncluded = currentPlan === "Picnic" ? 500 : 2500;
  let extraBandwidth = value - baseIncluded;
  let costPerGB = currentPlan === "Picnic" ? 0.12 : 0.08;
  return extraBandwidth > 0 ? extraBandwidth * costPerGB : 0;
}

function calculatePriceRequests(value) {
  let baseIncluded = currentPlan === "Picnic" ? 1000000 : 5000000;
  let extraRequests = value - baseIncluded;
  let costPer10k = currentPlan === "Picnic" ? 0.2 : 0.15;
  return extraRequests > 0 ? (extraRequests / 10000) * costPer10k : 0;
}

document
  .getElementById("planToggle")
  .addEventListener("click", function (event) {
    event.preventDefault();
    currentPlan = currentPlan === "Picnic" ? "Fiesta" : "Picnic";

    updatePlanDisplay(currentPlan);

    // Recalculate pricing
    updatePricing();
  });

function recommendPlanUpgrade(totalPrice) {
  const recommendationDiv = document.getElementById("recommendedPlanUpgrade");

  // Display the recommendation if the current plan is Picnic and the total price exceeds $100
  if (currentPlan === "Picnic" && totalPrice > 100) {
    recommendationDiv.style.opacity = "1";
  } else {
    recommendationDiv.style.opacity = "0";
  }
}

function updatePlanDisplay(plan) {
  // Set the plan name
  //document.getElementById("planName").textContent = plan + " Plan";

  // Set the base plan fee and update the display
  const pricePlanFee = plan === "Picnic" ? 20 : 100;

  // Update the cost per extra unit based on the plan
  document.getElementById("pricePerExtraPinnedFiles").textContent =
    plan === "Picnic" ? "0.20" : "0.15";
  document.getElementById("pricePerExtraStorage").textContent =
    plan === "Picnic" ? "0.10" : "0.05";
  document.getElementById("pricePerExtraBandwidth").textContent =
    plan === "Picnic" ? "0.12" : "0.08";
  document.getElementById("pricePerExtraRequests").textContent =
    plan === "Picnic" ? "0.20" : "0.15";

  updatePricing();
}

function showMessageForFiesta(elementId, currentValue, fiestaMinValue) {
  // Convert currentValue to a string in case it's not
  const valueAsString = String(currentValue).replace(/,/g, "");
  const numericCurrentValue = Number(valueAsString); // Convert to number after ensuring it's a string
  const messageElement = document.getElementById(elementId);
  messageElement.style.opacity =
    numericCurrentValue === fiestaMinValue ? "1" : "0";
}

function updateMarkerPosition(
  sliderId,
  markerId,
  markerValue,
  minValue,
  maxValue
) {
  const sliderElement = document.getElementById(sliderId);
  const markerElement = document.getElementById(markerId);
  const range = maxValue - minValue;
  const relativePosition = (markerValue - minValue) / range;
  const sliderWidth = sliderElement.offsetWidth;

  markerElement.style.left = `${relativePosition * sliderWidth + 2}px`;
}

// fucntion to update all markers on window resize by calling updateMarkerPosition again
function updateAllMarkers() {
  updateMarkerPosition(
    "sliderPinnedFile",
    "markerPinnedFile",
    100000,
    20000,
    220000
  );
  updateMarkerPosition("sliderStorage", "markerStorage", 2500, 500, 10000);
  updateMarkerPosition("sliderGateways", "markerGateways", 3, 1, 11);
  updateMarkerPosition("sliderBandwidth", "markerBandwidth", 2500, 500, 7500);
  updateMarkerPosition(
    "sliderRequests",
    "markerRequests",
    5000000,
    1000000,
    10000000
  );
}
