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
                // You would normally process the image here to extract a template
                const template = imageSrc; // Replace with actual template processing
                resolve(template);
            } else {
                reject(new Error('No image source provided.'));
            }
        });
    };

    return FingerprintSdk;
})();

function samplesAcquired(s) {   
    localStorage.setItem("imageSrc", "");                
    let samples = JSON.parse(s.samples);            
    localStorage.setItem("imageSrc", "data:image/png;base64," + Fingerprint.b64UrlTo64(samples[0]));
    let vDiv = document.getElementById('imagediv');
    vDiv.innerHTML = "";
    let image = document.createElement("img");
    image.id = "image";
    image.src = localStorage.getItem("imageSrc");
    vDiv.appendChild(image);
}

module.exports = { FingerprintSdk, Fingerprint };
