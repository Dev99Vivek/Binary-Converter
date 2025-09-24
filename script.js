

    // Elements
    const imageFile = document.getElementById('imageFile');
    const imageCanvas = document.getElementById('imageCanvas');
    const binaryOut = document.getElementById('binaryOut');
    const toBinaryBtn = document.getElementById('toBinaryBtn');
    const downloadBitsBtn = document.getElementById('downloadBitsBtn');
    const downloadBytesBtn = document.getElementById('downloadBytesBtn');
    const modeLabel = document.getElementById('modeLabel');
    const pixelCount = document.getElementById('pixelCount');

    const widthIn = document.getElementById('widthIn');
    const heightIn = document.getElementById('heightIn');
    const binaryFile = document.getElementById('binaryFile');
    const loadBinaryFileBtn = document.getElementById('loadBinaryFileBtn');
    const binaryIn = document.getElementById('binaryIn');
    const toImageBtn = document.getElementById('toImageBtn');
    const downloadImageBtn = document.getElementById('downloadImageBtn');
    const reconCanvas = document.getElementById('reconCanvas');
    const status = document.getElementById('status');

    const modeRadios = [...document.querySelectorAll('input[name="mode"]')];
    const mode2Radios = [...document.querySelectorAll('input[name="mode2"]')];

    let currentImageData = null; // ImageData from original image
    let lastBytes = null;        // Uint8Array of exported raw bytes
    let lastReconImageData = null; // ImageData from reconstruction

    // Helpers
    const getMode = () => (modeRadios.find(r => r.checked)?.value || 'gray');
    const getMode2 = () => (mode2Radios.find(r => r.checked)?.value || 'gray');

    const clamp = (v) => Math.min(255, Math.max(0, v | 0));
    const rgbToGray = (r, g, b) => clamp(Math.round(0.2126 * r + 0.7152 * g + 0.0722 * b));
    const byteToBits = (byte) => byte.toString(2).padStart(8, '0');
    const bytesToBitsString = (bytes) => {
      let out = '';
      for (let i = 0; i < bytes.length; i++) {
        out += byteToBits(bytes[i]);
      }
      return out;
    };
    const stripNonBits = (str) => (str || '').replace(/[^01]/g, '');

    function drawImageToCanvas(img) {
      const maxW = 900, maxH = 600; // keep it reasonable inside UI
      const ratio = Math.min(1, maxW / img.width, maxH / img.height);
      const w = Math.max(1, Math.round(img.width * ratio));
      const h = Math.max(1, Math.round(img.height * ratio));
      imageCanvas.width = w;
      imageCanvas.height = h;
      const ctx = imageCanvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, w, h);
      currentImageData = ctx.getImageData(0, 0, w, h);
      pixelCount.textContent = (w * h).toLocaleString();
      widthIn.value = w;
      heightIn.value = h;
    }

    function handleImageFile(file) {
      if (!file) return;
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => { drawImageToCanvas(img); URL.revokeObjectURL(url); };
      img.onerror = () => { status.textContent = 'Image load failed.'; status.className = 'hint error'; URL.revokeObjectURL(url); };
      img.src = url;
    }

    imageFile.addEventListener('change', (e) => handleImageFile(e.target.files[0]));

    // Mode labels
    function updateModeLabel() {
      const m = getMode();
      modeLabel.textContent = m === 'gray' ? 'Grayscale 8-bit' : 'RGB 24-bit';
    }
    modeRadios.forEach(r => r.addEventListener('change', updateModeLabel));
    updateModeLabel();

    // Image ➜ Binary
    toBinaryBtn.addEventListener('click', () => {
      if (!currentImageData) {
        status.textContent = 'Upload an image first.'; status.className = 'hint error';
        return;
      }
      const mode = getMode();
      const { width, height, data } = currentImageData; // RGBA bytes
      const totalPixels = width * height;

      let bytes;
      if (mode === 'gray') {
        bytes = new Uint8Array(totalPixels);
        for (let i = 0, p = 0; i < data.length; i += 4, p++) {
          const r = data[i], g = data[i + 1], b = data[i + 2];
          bytes[p] = rgbToGray(r, g, b);
        }
      } else {
        bytes = new Uint8Array(totalPixels * 3);
        for (let i = 0, p = 0, o = 0; i < data.length; i += 4, p++, o += 3) {
          bytes[o] = data[i];       // R
          bytes[o + 1] = data[i+1]; // G
          bytes[o + 2] = data[i+2]; // B
        }
      }

      lastBytes = bytes;

      // Produce readable bits grouped per pixel: 8 or 24 bits, line breaks per row
      const groupSize = (mode === 'gray') ? 1 : 3;
      let out = '';
      for (let y = 0; y < height; y++) {
        const rowStart = y * width * groupSize;
        for (let x = 0; x < width; x++) {
          const pxStart = rowStart + x * groupSize;
          if (mode === 'gray') {
            out += byteToBits(bytes[pxStart]);              // 8 bits
          } else {
            out += byteToBits(bytes[pxStart]);              // R
            out += byteToBits(bytes[pxStart + 1]);          // G
            out += byteToBits(bytes[pxStart + 2]);          // B
          }
          if (x < width - 1) out += ' '; // space between pixels
        }
        if (y < height - 1) out += '\n'; // newline between rows
      }

      binaryOut.value = out;
      status.textContent = `Converted ${totalPixels.toLocaleString()} px to ${mode === 'gray' ? '8-bit' : '24-bit'} binary.`;
      status.className = 'hint success';

      // Mirror metadata for reconstruction
      widthIn.value = width;
      heightIn.value = height;
      mode2Radios.forEach(r => r.checked = (r.value === mode));
    });

    // Download .txt bits
    downloadBitsBtn.addEventListener('click', () => {
      const bits = binaryOut.value;
      if (!bits.trim()) { status.textContent = 'Nothing to download.'; status.className = 'hint error'; return; }
      const blob = new Blob([bits], { type: 'text/plain' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'image_binary.txt';
      a.click();
      URL.revokeObjectURL(a.href);
    });

    // Download raw bytes .bin
    downloadBytesBtn.addEventListener('click', () => {
      if (!lastBytes || !lastBytes.length) { status.textContent = 'Export bytes first (Convert to Binary).'; status.className = 'hint error'; return; }
      const blob = new Blob([lastBytes], { type: 'application/octet-stream' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'image_bytes.bin';
      a.click();
      URL.revokeObjectURL(a.href);
    });

    // Binary file loader
    loadBinaryFileBtn.addEventListener('click', async () => {
      const file = binaryFile.files?.[0];
      if (!file) { status.textContent = 'Choose a .txt or .bin file first.'; status.className = 'hint error'; return; }

      const ext = file.name.toLowerCase().split('.').pop();
      try {
        if (ext === 'txt') {
          const text = await file.text();
          binaryIn.value = text;
          status.textContent = 'Text binary loaded.'; status.className = 'hint success';
        } else {
          const buf = await file.arrayBuffer();
          const bytes = new Uint8Array(buf);
          // Convert to plain bit string for textarea; grouping will be handled by reconstruction
          binaryIn.value = bytesToBitsString(bytes);
          status.textContent = `Raw bytes loaded: ${bytes.length.toLocaleString()} bytes → bits.`; status.className = 'hint success';
        }
      } catch (e) {
        status.textContent = 'Failed to load file.'; status.className = 'hint error';
      }
    });

    // Binary ➜ Image
    toImageBtn.addEventListener('click', () => {
      const mode = getMode2();
      const width = parseInt(widthIn.value, 10);
      const height = parseInt(heightIn.value, 10);
      if (!width || !height || width <= 0 || height <= 0) {
        status.textContent = 'Enter valid width and height.'; status.className = 'hint error';
        return;
      }

      const rawBits = stripNonBits(binaryIn.value);
      if (!rawBits.length) {
        status.textContent = 'Paste bits or load a binary file.'; status.className = 'hint error';
        return;
      }

      const bitsPerPixel = (mode === 'gray') ? 8 : 24;
      const totalBitsNeeded = width * height * bitsPerPixel;
      if (rawBits.length < totalBitsNeeded) {
        status.textContent = `Not enough bits: need ${totalBitsNeeded.toLocaleString()}, have ${rawBits.length.toLocaleString()}.`;
        status.className = 'hint error';
        return;
      }
      if (rawBits.length > totalBitsNeeded) {
        // Allow extra bits; we’ll truncate. Also: helps if file carries padding.
        status.textContent = 'Extra bits detected; truncating to fit dimensions.';
        status.className = 'hint';
      }

      // Convert bits to bytes
      const bytesNeeded = width * height * (mode === 'gray' ? 1 : 3);
      const imgBytes = new Uint8ClampedArray(width * height * 4); // RGBA
      let bitIndex = 0;
      let pxIndex = 0;

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++, pxIndex++) {
          const base = (y * width + x) * 4;
          if (mode === 'gray') {
            const byteStr = rawBits.slice(bitIndex, bitIndex + 8); bitIndex += 8;
            const v = parseInt(byteStr, 2) & 0xFF;
            imgBytes[base] = v;
            imgBytes[base + 1] = v;
            imgBytes[base + 2] = v;
            imgBytes[base + 3] = 255;
          } else {
            const rStr = rawBits.slice(bitIndex, bitIndex + 8); bitIndex += 8;
            const gStr = rawBits.slice(bitIndex, bitIndex + 8); bitIndex += 8;
            const bStr = rawBits.slice(bitIndex, bitIndex + 8); bitIndex += 8;
            imgBytes[base] = parseInt(rStr, 2) & 0xFF;
            imgBytes[base + 1] = parseInt(gStr, 2) & 0xFF;
            imgBytes[base + 2] = parseInt(bStr, 2) & 0xFF;
            imgBytes[base + 3] = 255;
          }
        }
      }

      reconCanvas.width = width;
      reconCanvas.height = height;
      const ctx = reconCanvas.getContext('2d');
      const outData = new ImageData(imgBytes, width, height);
      ctx.putImageData(outData, 0, 0);

      lastReconImageData = outData;

      status.textContent = `Reconstructed ${width}×${height} in ${mode === 'gray' ? 'grayscale' : 'RGB'} mode.`;
      status.className = 'hint success';
    });

    // Download reconstructed image
    downloadImageBtn.addEventListener('click', () => {
      if (!lastReconImageData) {
        status.textContent = 'Reconstruct an image first.'; status.className = 'hint error'; return;
      }
      const w = lastReconImageData.width;
      const h = lastReconImageData.height;
      const temp = document.createElement('canvas');
      temp.width = w; temp.height = h;
      temp.getContext('2d').putImageData(lastReconImageData, 0, 0);
      const a = document.createElement('a');
      a.href = temp.toDataURL('image/png');
      a.download = 'reconstructed.png';
      a.click();
    });