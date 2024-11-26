const Fingerprint = window.Fingerprint;

const FingerprintSdk = (function () {
  function FingerprintSdk() {
    this.sdk = new Fingerprint.WebApi();

    this.sdk.onSamplesAcquired = (s) => {
      samplesAcquired(s);
    };
  }

  FingerprintSdk.prototype.getDeviceList = function () {
    return this.sdk.enumerateDevices();
  };

  FingerprintSdk.prototype.startCapture = function () {
    this.sdk.startAcquisition(Fingerprint.SampleFormat.PngImage).then(
      () => console.log("You can now scan your Finger."),
      (error) => console.log('Error starting capture:', error)
    );
  };

  FingerprintSdk.prototype.stopCapture = function () {
    this.sdk.stopAcquisition().then(
      () => console.log('Capture stopped'),
      (error) => console.log('Error stopping capture:', error)
    );
  };

  FingerprintSdk.prototype.generateTemplate = function (imageSrc) {
    return new Promise((resolve, reject) => {
      if (imageSrc) {
        processImageToTemplate(imageSrc)
          .then((template) => {
            resolve(template); // Return the template to the frontend
          })
          .catch(reject);
      } else {
        reject(new Error('No image source available.'));
      }
    });
  };
  

  FingerprintSdk.prototype.createFID = function (template) {
    // Create a unique FID based on the template data
    return generateFID(template);
  };

  FingerprintSdk.prototype.extractMinutiae = function (imageSrc) {
    return extractFingerprintFeatures(imageSrc);
  };

  function processImageToTemplate(imageSrc) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const quality = calculateImageQuality(imageData.data, canvas.width, canvas.height);
        const template = extractFingerprintFeatures(imageData.data, canvas.width, canvas.height);
        template.quality = quality;
        resolve(template);
      };

      img.onerror = (error) => reject(new Error('Failed to load image: ' + error.message));
      img.src = imageSrc;
    });
  }

  function calculateImageQuality(pixelData, width, height) {
    let totalBrightness = 0;
    let totalPixels = width * height;
  
    for (let i = 0; i < totalPixels; i++) {
      const r = pixelData[i * 4];
      const g = pixelData[i * 4 + 1];
      const b = pixelData[i * 4 + 2];
      const brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b; // Standard formula for brightness
      totalBrightness += brightness;
    }
  
    const avgBrightness = totalBrightness / totalPixels;
  
    // Map average brightness to quality level
    let quality;
    if (avgBrightness > 200) {
      quality = "Good";
    } else if (avgBrightness > 180) {
      quality = "TooLight";
    } else if (avgBrightness < 50) {
      quality = "TooDark";
    } else {
      quality = "LowContrast";
    }
  
    return quality; // Return the quality word
  }

  function extractFingerprintFeatures(pixelData, width, height) {
    let minutiaePoints = [];
    
    // Convert the x, y coordinates into ASCII values
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        const r = pixelData[index];
        const g = pixelData[index + 1];
        const b = pixelData[index + 2];
        // If the pixel is dark enough (likely part of the fingerprint ridge)
        if (r < 128 && g < 128 && b < 128) {
          // Convert x and y to ASCII codes and join them
          const xChar = String.fromCharCode(65 + (x % 26)); // Map x to ASCII characters (A-Z)
          const yChar = String.fromCharCode(65 + (y % 26)); // Map y to ASCII characters (A-Z)
          minutiaePoints.push(`${xChar}${yChar}`); // Combine the xChar and yChar to form a pair like "AC", "BC", etc.
        }
      }
    }
  
    // Return the minutiae points as a single concatenated string
    return { minutiaePoints: minutiaePoints.join("") };
  }
  
  

  function samplesAcquired(s) {
    const samples = JSON.parse(s.samples);
    const imageSrc = "data:image/png;base64," + Fingerprint.b64UrlTo64(samples[0]);
    localStorage.setItem("imageSrc", imageSrc);  // Ensure it's being saved
  
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
      // Now calculate the quality
      const quality = calculateImageQuality(imageData.data, canvas.width, canvas.height);
      localStorage.setItem("imageQuality", quality); // Save the quality in localStorage
  
      document.getElementById('imagediv').innerHTML = `<img src="${imageSrc}" id="image" />`;
    };
  
    image.src = imageSrc;
  }
  
  

  function generateFID(template) {
    // Create a simple hash based on the minutiae points
    const hash = template.minutiaePoints.map(point => `${point.x},${point.y}`).join('|');
    return `FID-${btoa(hash)}`; // Base64 encode the hash for uniqueness
  }

  return FingerprintSdk;
})();

export { FingerprintSdk, Fingerprint };