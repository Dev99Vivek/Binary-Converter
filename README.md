# Binary Image Lab — README

Binary Image Lab is a dark, cinematic web tool to convert images ⇄ binary. It supports Grayscale (8‑bit) and RGB (24‑bit) flows, file import/export, preview, and reconstructed image download. Built with plain HTML, CSS, and JavaScript and styled with a neon cyberpunk aesthetic (Sora + JetBrains Mono).

---

## Features
- Convert image → binary (Grayscale 8‑bit or RGB 24‑bit).  
- Convert binary → image (specify width, height, choose mode).  
- Upload/download: image files, .txt binary, raw .bin bytes, reconstructed PNG.  
- Live previews for original and reconstructed images.  
- Responsive, accessible, neon UI with Sora + JetBrains Mono font pairing.  
- Reduced‑motion support and accessible focus states.

---

## Quickstart
1. Copy project files into a folder.  
2. Open index.html in any modern browser (Chrome, Edge, Firefox).  
3. (Optional) Serve via local server for better file handling:
   - Python 3: `python -m http.server 8000` then open `http://localhost:8000`.

---

## Suggested file structure
- index.html — main UI + script (single file version).  
- styles.css — (optional) extracted CSS (use the full CSS provided).  
- README.md — this file.

---

## How to use

Image → Binary
1. Upload an image using the file input.  
2. Select mode: Grayscale (8‑bit) or RGB (24‑bit).  
3. Click Convert to Binary.  
4. Binary output appears in the textarea (pixels grouped, line breaks per row).  
5. Download as .txt (readable bits) or .bin (raw bytes).

Binary → Image
1. Paste or load a binary file into the binary input.  
2. Enter image Width and Height (pixels).  
3. Select reconstruction mode (Grayscale or RGB).  
4. Click Convert to Image to generate preview.  
5. Download reconstructed PNG.

Important format rules
- Grayscale: 1 pixel = 8 bits → total bits = width × height × 8.  
- RGB: 1 pixel = 24 bits (R8 G8 B8) → total bits = width × height × 24.  
- .txt files may contain spaces/newlines; parser strips non‑0/1 characters.  
- .bin files are read as raw bytes converted to bits.

Examples
- Red pixel (RGB): 11111111 00000000 00000000  
- Gray 128 (grayscale): 10000000

---

## Integration notes

Fonts
Include in <head>:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Sora:wght@400;600;700&display=swap" rel="stylesheet">
```

CSS
Use the provided responsive CSS (styles.css) for neon UI. Link it:
```html
<link rel="stylesheet" href="styles.css">
```

JS
Main script responsibilities:
- Image → canvas → ImageData → bytes → bit text.  
- Binary text or bytes → parse → bytes → ImageData → canvas.  
- File I/O (Blob downloads), UI updates, and mode sync.

---

## Troubleshooting

- Reconstructed image is grayscale despite expecting color:
  - Ensure binary was exported in RGB mode (24 bits/pixel) and reconstruction mode is set to RGB.  
  - Verify total bits: width × height × 24 must match available bits.

- “Not enough bits” error:
  - Confirm width and height match original image dimensions.  
  - If using .bin, confirm interpretation as raw bytes → bits.

- Large images slow or crash:
  - Resize images before converting or add UI constraints (max width/height).  
  - Consider chunked processing for very large files.

---

## Accessibility & performance tips
- App respects prefers-reduced-motion.  
- Disable background/matrix animations on low‑power devices and mobile.  
- Load only necessary font weights for performance.

---

## Roadmap / Ideas
- Matrix rain aesthetic toggle (GPU‑friendly canvas).  
- Compression: RLE / gzip / Base64 export options.  
- Steganography mode (hide messages in LSB).  
- Batch processing and drag/drop folder import.  
- Bit‑depth controls (1‑bit, 4‑bit) with dithering.  
- Inline editable binary editor with live reconstruction.

---

## Keyboard shortcuts (suggested)
- Ctrl/Cmd + B → Convert to Binary.  
- Ctrl/Cmd + I → Convert to Image.  
- Ctrl/Cmd + S on download buttons may trigger browser save (use with care).

---

## License
Use as you like for personal or commercial projects. Add a LICENSE file if you need a specific license (MIT recommended).

---

## Contact / Notes
- This tool is a single‑page, static web app — easy to fork and extend.  
- If you want, I can provide: full index.html linking styles.css, matrix rain JS, or a smaller CSS-only theme variant.

---
