const Fingerprint = window.Fingerprint;

const FingerprintSdk = (function () {
  function FingerprintSdk() {
    this.sdk = new Fingerprint.WebApi();

    this.sdk.onSamplesAcquired = function (s) {
      samplesAcquired(s);
    };
  }

  FingerprintSdk.prototype.getDeviceList = function () {
    return this.sdk.enumerateDevices();
  };

  FingerprintSdk.prototype.startCapture = function () {
    this.sdk.startAcquisition(Fingerprint.SampleFormat.PngImage).then(
      () => console.log('Capturing fingerprint'),
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
          .then(resolve)
          .catch(reject);
      } else {
        reject(new Error('No image source provided.'));
      }
    });
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
        const template = extractFingerprintFeatures(imageData.data, canvas.width, canvas.height);
        resolve(template);
      };

      img.onerror = (error) => reject(new Error('Failed to load image: ' + error.message));
      img.src = imageSrc;
    });
  }

  function extractFingerprintFeatures(pixelData, width, height) {
    const features = { minutiaePoints: [], ridges: [] };
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        const r = pixelData[index];
        const g = pixelData[index + 1];
        const b = pixelData[index + 2];
        if (r < 128 && g < 128 && b < 128) {
          features.minutiaePoints.push({ x, y });
        }
      }
    }
    return features;
  }

  function samplesAcquired(s) {
    const samples = JSON.parse(s.samples);
    const imageSrc = "data:image/png;base64," + Fingerprint.b64UrlTo64(samples[0]);
    localStorage.setItem("imageSrc", imageSrc);
    document.getElementById('imagediv').innerHTML = `<img src="${imageSrc}" id="image" />`;
  }

  return FingerprintSdk;
})();

export { FingerprintSdk, Fingerprint };
