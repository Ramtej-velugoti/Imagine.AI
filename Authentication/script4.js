const axios = require('axios');
const outputDiv = document.getElementById("output");
// Function to generate an image
async function generateImage() {
  const generateData = {
    prompt: 'a cat chasing a rat',
    negativePrompt: 'asymmetric, watermarks',
    steps: 50,
    width: 1024,
    height: 1024,
    numberOfImages: 1,
    promptStrength: 7,
    seed: 4523184,
  };

  const generateOptions = {
    method: 'post',
    url: 'https://api.tryleap.ai/api/v1/images/models/26a1a203-3a46-42cb-8cfa-f4de075907d8/inferences',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: 'Bearer 337f1799-fecc-4342-9853-db725fea6b6d',
    },
    data: generateData,
  };

  try {
    const response = await axios(generateOptions);
    const imageId = response.data.id;
    console.log('Generated image ID:', imageId);
    // Call the checkStatusAndFetchImage function with the generated image ID
    checkStatusAndFetchImage(imageId);
  } catch (error) {
    console.error('Image generation failed:', error);
  }
}
async function checkStatusAndFetchImage(imageId) {
    console.log(imageId)
    const fetchOptions = {
      method: 'get',
      url: `https://api.tryleap.ai/api/v1/images/models/26a1a203-3a46-42cb-8cfa-f4de075907d8/inferences/${imageId}`,
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        authorization: 'Bearer 337f1799-fecc-4342-9853-db725fea6b6d',
      },
    };
  
    try {
        const response = await axios(fetchOptions);
        console.log(`Response for image ${imageId}:`, response.data);
      
        if (response.data.status === 'finished') {
          // Image is finished, fetch it here and handle as needed
          const imageURI = response.data.images[0].uri;
          console.log(imageURI);
          const imageElement = document.createElement('img');
            imageElement.src = imageURI;
            outputDiv.innerHTML = ''; 
            outputDiv.appendChild(imageElement);
          console.log('Image is finished. Fetching...');
          // Fetch and process the image
          // ...
        } else if (response.data.status === 'queued') {
          // Image is still in queue, check again after a delay (e.g., 5 seconds)
          console.log('Image is still in queue. Checking again...');
          setTimeout(() => {
            checkStatusAndFetchImage(imageId);
          }, 5000); // 5 seconds delay
        } else {
          console.log('Image generation failed. Status:', response.data.status);
          // Add your error handling logic here
        }
      } catch (error) {
        console.error('Fetching image status failed:', error);
        // Add your error handling logic here
      }
      
}
  
// Call the generateImage function to start the image generation process
generateImage();
