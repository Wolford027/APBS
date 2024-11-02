const Fingerprint = window.Fingerprint;

const FingerprintSdk = (function () {
    function FingerprintSdk() {
        this.sdk = new Fingerprint.WebApi();

        this.sdk.onSamplesAcquired = function(s) {
            samplesAcquired(s);
        }
    }

    FingerprintSdk.prototype.getDeviceList = function () {
        return this.sdk.enumerateDevices();
    }

    FingerprintSdk.prototype.startCapture = function () {
        this.sdk.startAcquisition(Fingerprint.SampleFormat.PngImage).then(function () {
            console.log('Capturing fingerprint');
        }, function (error) {
            console.log('Error when starting fingerprint capture');
        });
    }

    FingerprintSdk.prototype.stopCapture = function () {
        this.sdk.stopAcquisition().then(function () {
            console.log('Fingerprint capture stopped');
        }, function (error) {
            console.log('Error when stopping fingerprint capture');
        });
    }
    

    FingerprintSdk.prototype.generateTemplate = function(imageSrc) {
        return new Promise((resolve, reject) => {
            if (imageSrc) {
                // Simulate template processing from the image source
                const template = processImageToTemplate(imageSrc);
                resolve(template);
            } else {
                reject(new Error('No image source provided.'));
            }
        });
    };

     // Define the function to generate a fingerprint template
     FingerprintSdk.prototype.generateFingerprintTemplate = async function() {
        const imageSrc = localStorage.getItem("imageSrc");
        if (imageSrc) {
            try {
                const template = await this.generateTemplate(imageSrc);
                console.log('Generated Template:', template);
                // Continue with further processing...
            } catch (error) {
                console.error('Error generating template:', error);
            }
        } else {
            console.error('No image source available to generate template');
        }
    };
    
    function processImageToTemplate(imageSrc) {
        return new Promise((resolve, reject) => {
            // 1. Create an image element
            const img = new Image();
            img.onload = () => {
                // 2. Create a canvas and draw the image on it
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
    
                // 3. Get the image data from the canvas
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const pixelData = imageData.data; // This is an array of pixel data
    
                // 4. Process the pixel data to extract features
                const template = extractFingerprintFeatures(pixelData, canvas.width, canvas.height);
    
                // 5. Resolve with the fingerprint template
                resolve(template);
            };
    
            img.onerror = (error) => {
                reject(new Error('Failed to load image: ' + error.message));
            };
    
            // 6. Set the image source (assume imageSrc is a base64 encoded string)
            img.src = imageSrc; 
        });
    }
    
    function extractFingerprintFeatures(pixelData, width, height) {
        // Implement your image processing algorithm here
        // This is a placeholder for feature extraction logic
        const features = {
            // Extracted features should go here
            minutiaePoints: [], // Example: Store minutiae points found
            ridges: [] // Example: Store ridge counts or positions
        };
    
        // Example feature extraction logic (very simplified)
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = (y * width + x) * 4; // Calculate index in pixel array
                const r = pixelData[index];     // Red channel
                const g = pixelData[index + 1]; // Green channel
                const b = pixelData[index + 2]; // Blue channel
    
                // Example condition to identify a pixel of interest (very naive)
                if (r < 128 && g < 128 && b < 128) { // If the pixel is dark (assumed part of the fingerprint)
                    // Add logic to extract features, e.g., minutiae
                    features.minutiaePoints.push({ x, y }); // Store the point
                }
            }
        }
    
        return features; // Return the extracted features
    }
    

    return FingerprintSdk;
})();

function samplesAcquired(s) {   
    let samples = JSON.parse(s.samples);            
    const imageSrc = "data:image/png;base64," + Fingerprint.b64UrlTo64(samples[0]);
    localStorage.setItem("imageSrc", imageSrc);
    
    let vDiv = document.getElementById('imagediv');
    vDiv.innerHTML = "";
    let image = document.createElement("img");
    image.id = "image";
    image.src = imageSrc; // Use the newly created image source
    vDiv.appendChild(image);

    // Create an instance of FingerprintSdk and call the method
    const fingerprintSdk = new FingerprintSdk();
    fingerprintSdk.generateFingerprintTemplate(); // Call the method on the instance
}

module.exports = { FingerprintSdk, Fingerprint };
