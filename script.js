// script.js

// getting form and button elements
const imgInput = document.getElementById("image-input");
const txtForm = document.getElementById("generate-meme");
const submitBtn = document.querySelector('button[type="submit"]');
const clearBtn = document.querySelector('button[type="reset"]');
const readTextBtn = document.querySelector('button[type="button"]');
const volumeBtn = document.querySelector('input[type="range"]');
const volumeImg = document.getElementById("volume-group").firstElementChild;

console.log(volumeImg);

// creating speech synth objects and voice elements
var synth = window.speechSynthesis;
var volumeLvl = 100;

// initializing voice options and synthesis
function populateVoiceList() {
  var voices = synth.getVoices();
  var voiceSelect = document.getElementById("voice-selection");
  voiceSelect.removeChild(voiceSelect.firstChild);
  voiceSelect.disabled = false;

  for (let i = 0; i < voices.length ; i++) {
    var option = document.createElement('option');
    option.textContent = voices[i].name + ' (' + voices[i].lang + ')';

    if(voices[i].default) {
      option.textContent += ' -- DEFAULT';
    }

    option.setAttribute('data-lang', voices[i].lang);
    option.setAttribute('data-name', voices[i].name);
    voiceSelect.appendChild(option);
  }
}

populateVoiceList();
if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = populateVoiceList;
}

// getting canvas
const canvas = document.getElementById("user-image");

const img = new Image(); // used to load image from <input> and draw to canvas
let topText = "";
let bottomText = "";

// Fires whenever the img object loads a new image (such as with img.src =)
img.addEventListener('load', () => {
  var ctx = canvas.getContext('2d');
  ctx.clearRect(0,0,400,400);

  // drawing black rect
  ctx.fillStyle = "rgba(0, 0, 0, 1)";
  ctx.fillRect(0,0,400,400);

  // getting image dimensions for canvas
  const dims = getDimmensions(400, 400, img.width, img.height);

  // drawing image on canvas
  ctx.drawImage(img, dims.startX, dims.startY, dims.width, dims.height);
});

/**
 * Takes in the dimensions of the canvas and the new image, then calculates the new
 * dimensions of the image so that it fits perfectly into the Canvas and maintains aspect ratio
 * @param {number} canvasWidth Width of the canvas element to insert image into
 * @param {number} canvasHeight Height of the canvas element to insert image into
 * @param {number} imageWidth Width of the new user submitted image
 * @param {number} imageHeight Height of the new user submitted image
 * @returns {Object} An object containing four properties: The newly calculated width and height,
 * and also the starting X and starting Y coordinate to be used when you draw the new image to the
 * Canvas. These coordinates align with the top left of the image.
 */
function getDimmensions(canvasWidth, canvasHeight, imageWidth, imageHeight) {
  let aspectRatio, height, width, startX, startY;

  // Get the aspect ratio, used so the picture always fits inside the canvas
  aspectRatio = imageWidth / imageHeight;

  // If the apsect ratio is less than 1 it's a verical image
  if (aspectRatio < 1) {
    // Height is the max possible given the canvas
    height = canvasHeight;
    // Width is then proportional given the height and aspect ratio
    width = canvasHeight * aspectRatio;
    // Start the Y at the top since it's max height, but center the width
    startY = 0;
    startX = (canvasWidth - width) / 2;
    // This is for horizontal images now
  } else {
    // Width is the maximum width possible given the canvas
    width = canvasWidth;
    // Height is then proportional given the width and aspect ratio
    height = canvasWidth / aspectRatio;
    // Start the X at the very left since it's max width, but center the height
    startX = 0;
    startY = (canvasHeight - height) / 2;
  }

  return { 'width': width, 'height': height, 'startX': startX, 'startY': startY }
}

// assigning functionality to image input file
imgInput.addEventListener('change', (e) => {
  e.preventDefault();
  console.log("change");
  img.src = URL.createObjectURL(e.target.files[0]);
  img.alt = e.target.value;
});

volumeBtn.addEventListener('change', (e) => {
  volumeLvl = e.target.value;
  if (volumeLvl >= 67) {
    volumeImg.src = "icons/volume-level-3.svg";
    volumeImg.alt = "Volume Level 3";
  } else if (volumeLvl >= 34) {
    volumeImg.src = "icons/volume-level-2.svg";
    volumeImg.alt = "Volume Level 2";
  } else if (volumeLvl >= 1) {
    volumeImg.src = "icons/volume-level-1.svg";
    volumeImg.alt = "Volume Level 1";
  } else {
    volumeImg.src = "icons/volume-level-0.svg";
    volumeImg.alt = "Volume Level 0";
  }
})

// assigning functionality to clear button
clearBtn.addEventListener('click', (e) => {
  e.preventDefault();
  var ctx = canvas.getContext('2d');
  ctx.clearRect(0,0,400,400);
  topText = "";
  bottomText = "";

  // toggling buttons
  clearBtn.disabled = true;
  readTextBtn.disabled = true;
  submitBtn.disabled = false;
});

// assigning functionality to read button
readTextBtn.addEventListener('click', (e) => {
  e.preventDefault();

  // getting utterance
  var toUtter = new SpeechSynthesisUtterance(topText);
  var voiceSelect = document.getElementById("voice-selection");
  var voices = synth.getVoices();

  // choosing voice and volume
  var selectedOption = voiceSelect.selectedOptions[0].getAttribute('data-name');
  for (var i = 0; i < voices.length; i++) {
    if(voices[i].name === selectedOption) {
      toUtter.voice = voices[i];
    }
  }

  toUtter.volume = volumeLvl/100;
  synth.speak(toUtter);
  toUtter.text = bottomText;
  synth.speak(toUtter);
});

// assigning generate text button functionality
submitBtn.addEventListener('click', (e) => {
  e.preventDefault();

  // Getting field contents and setting them
  var formData = new FormData(txtForm);
  topText = formData.get("textTop");
  bottomText = formData.get("textBottom");

  if (topText == "" && bottomText == "") {
    return;
  }

  // updating button visibility
  clearBtn.disabled = false;
  readTextBtn.disabled = false;
  submitBtn.disabled = true;

  // updating canvas
  var ctx = canvas.getContext('2d');
  ctx.font = '40px impact';
  ctx.textAlign = 'center';
  ctx.fillStyle = "white";
  ctx.fillText(topText, 200, 50);
  ctx.fillText(bottomText, 200, 375);
});

