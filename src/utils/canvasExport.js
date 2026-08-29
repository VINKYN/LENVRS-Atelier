// Calculate perceived luminance (ITU-R BT.709)
function getLuminance(hex) {
  if (!hex || typeof hex !== 'string') return 0;
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  if (c.length !== 6) return 0;
  const r = parseInt(c.substr(0, 2), 16) / 255;
  const g = parseInt(c.substr(2, 2), 16) / 255;
  const b = parseInt(c.substr(4, 2), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Convert hex string to RGB array
function hexToRgb(hex) {
  let c = (hex || '').replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  if (c.length !== 6) return [255, 255, 255];
  return [
    parseInt(c.substr(0, 2), 16) || 255,
    parseInt(c.substr(2, 2), 16) || 255,
    parseInt(c.substr(4, 2), 16) || 255
  ];
}

// Convert Hex to HSL
function hexToHsl(hex) {
  let c = (hex || '').replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const r = parseInt(c.substr(0, 2), 16) / 255;
  const g = parseInt(c.substr(2, 2), 16) / 255;
  const b = parseInt(c.substr(4, 2), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h * 360, s, l];
}

// Convert HSL to Hex
function hslToHex(h, s, l) {
  h = (h % 360 + 360) % 360;
  s = Math.max(0, Math.min(1, s));
  l = Math.max(0, Math.min(1, l));
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }
  const toHex = val => Math.max(0, Math.min(255, Math.round((val + m) * 255))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Soften any color into a very subtle, light, airy studio tone
function getSoftenedTone(hex, targetLightness, maxSat) {
  const [h, s, l] = hexToHsl(hex);
  const softS = Math.min(s * 0.35, maxSat);
  const softL = Math.max(l, targetLightness);
  return hslToHex(h, softS, softL);
}

// Extract the 2 lightest fabric colors (excluding topstitches) and soften them into subtle gradient tones
function getTwoLightestSoftenedTones(colors) {
  // 1. Filter out all topstitches / surpiqûres
  const fabricHexes = Object.entries(colors || {})
    .filter(([key, val]) => !key.toLowerCase().includes('topstitch') && typeof val === 'string' && val.startsWith('#'))
    .map(([, val]) => val);

  const uniqueHexes = Array.from(new Set(fabricHexes));

  if (uniqueHexes.length === 0) {
    return { c1: '#ffffff', c2: '#dce0e8' };
  }

  // 2. Sort by luminance descending (lightest first)
  uniqueHexes.sort((a, b) => getLuminance(b) - getLuminance(a));

  const hex1 = uniqueHexes[0];
  const hex2 = uniqueHexes.length > 1 ? uniqueHexes[1] : hex1;

  // 3. Make both colors very light, delicate and subtle
  const c1 = getSoftenedTone(hex1, 0.95, 0.18);
  const c2 = uniqueHexes.length > 1 
    ? getSoftenedTone(hex2, 0.89, 0.22)
    : getSoftenedTone(hex1, 0.89, 0.22);

  return { c1, c2 };
}

// Draw 4-Corner Diagonal Freeform Gradient (Illustrator Mesh Gradient style)
function drawIllustratorFreeformGradient(ctx, targetWidth, targetHeight, color1Hex, color2Hex) {
  // Diagonal 1: Top-Left (TL) & Bottom-Right (BR) -> c1 (Lightest Tone)
  // Diagonal 2: Top-Right (TR) & Bottom-Left (BL) -> c2 (2nd Lightest Tone)
  const c1 = hexToRgb(color1Hex);
  const c2 = hexToRgb(color2Hex);

  const W = 270;
  const H = 480;
  const offscreen = document.createElement('canvas');
  offscreen.width = W;
  offscreen.height = H;
  const offCtx = offscreen.getContext('2d');
  const imgData = offCtx.createImageData(W, H);
  const data = imgData.data;

  for (let y = 0; y < H; y++) {
    const v = y / (H - 1);
    // Smooth hermite curve (smoothstep) for silky continuous diffusion
    const sv = v * v * (3 - 2 * v);
    
    for (let x = 0; x < W; x++) {
      const u = x / (W - 1);
      const su = u * u * (3 - 2 * u);

      // Bilinear corner weights
      const wTL = (1 - su) * (1 - sv); // Top-Left: c1
      const wTR = su * (1 - sv);       // Top-Right: c2
      const wBL = (1 - su) * sv;       // Bottom-Left: c2
      const wBR = su * sv;             // Bottom-Right: c1

      const weightC1 = wTL + wBR;
      const weightC2 = wTR + wBL;

      const r = Math.round(weightC1 * c1[0] + weightC2 * c2[0]);
      const g = Math.round(weightC1 * c1[1] + weightC2 * c2[1]);
      const b = Math.round(weightC1 * c1[2] + weightC2 * c2[2]);

      const idx = (y * W + x) * 4;
      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = 255;
    }
  }

  offCtx.putImageData(imgData, 0, 0);

  // Smooth bicubic upscaling to target canvas (1080x1920)
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(offscreen, 0, 0, targetWidth, targetHeight);
  ctx.restore();
}

// Generate clean email link
export function generateEmailSummary(colors) {
  const subject = encodeURIComponent('Mon Vêtement Personnalisé // LENVRS Atelier');
  const body = encodeURIComponent(
`Bonjour,

Voici ma création personnalisée conçue sur LENVRS Atelier.
Date : ${new Date().toLocaleDateString('fr-FR')}

Conçu sur LENVRS Atelier.`
  );

  return `mailto:?subject=${subject}&body=${body}`;
}

// Composite exact 9:16 Instagram Story Card with Front-View Undistorted 3D Garment and Montserrat typography
export async function generateInstagramStoryCard(snapshotDataUrl, colors, instagramHandle = '') {
  // Ensure Montserrat font is fully loaded before drawing text on canvas
  if (typeof document !== 'undefined' && document.fonts) {
    try {
      await document.fonts.ready;
    } catch (e) {
      console.warn('Font loading check error:', e);
    }
  }

  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');

    // 1. Draw 4-corners diagonal Freeform Mesh Gradient with 2 lightest softened fabric colors
    const { c1, c2 } = getTwoLightestSoftenedTones(colors);
    drawIllustratorFreeformGradient(ctx, 1080, 1920, c1, c2);

    const drawContent = () => {
      // 2. Outer Thin Dark Border
      ctx.strokeStyle = '#1e2024';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(46, 46, 988, 1828);

      // 3. Official Logo at the Top
      const logoImg = new Image();
      logoImg.crossOrigin = 'anonymous';
      logoImg.onload = () => {
        const logoWidth = 430;
        const logoHeight = (logoImg.height / logoImg.width) * logoWidth;
        const logoX = (1080 - logoWidth) / 2;
        const logoY = 125;
        ctx.drawImage(logoImg, logoX, logoY, logoWidth, logoHeight);

        // 4. Draw Perfectly Proportioned 3D Garment
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const maxW = 720;
          const maxH = 800;
          const imgAspect = img.width / img.height;
          let drawW, drawH;

          if (imgAspect > maxW / maxH) {
            drawW = maxW;
            drawH = maxW / imgAspect;
          } else {
            drawH = maxH;
            drawW = maxH * imgAspect;
          }

          const imgX = (1080 - drawW) / 2;
          const imgY = 320 + (maxH - drawH) / 2;

          ctx.drawImage(img, imgX, imgY, drawW, drawH);

          // 5. Sub-headline: LVRW3-ATELIER (Montserrat Light)
          ctx.fillStyle = '#111111';
          ctx.font = '300 38px "Montserrat", sans-serif';
          ctx.textAlign = 'center';
          ctx.letterSpacing = '8px';
          ctx.fillText('LVRW3-ATELIER', 540, 1315);
          ctx.letterSpacing = '0px';

          // 6. Color Swatches Row (12 Square Swatches)
          const swatchList = [
            colors.body_front || '#ffffff',
            colors.waves_top || '#ffffff',
            colors.waves_mid || '#ffffff',
            colors.waves_bot || '#ffffff',
            colors.collar || '#ffffff',
            colors.sleeve_left || '#ffffff',
            colors.sleeve_cuff_left || '#ffffff',
            colors.sleeve_right || '#ffffff',
            colors.sleeve_cuff_right || '#ffffff',
            colors.body_back || '#ffffff',
            colors.hem_bottom || '#ffffff',
            colors.topstitches || '#8e9096'
          ];

          const swatchSize = 36;
          const swatchGap = 13;
          const totalSwatchW = swatchList.length * swatchSize + (swatchList.length - 1) * swatchGap;
          let curX = (1080 - totalSwatchW) / 2;
          const swatchY = 1375;

          swatchList.forEach((hex) => {
            const isPureWhite = (hex || '').toLowerCase() === '#ffffff';

            ctx.fillStyle = hex || '#ffffff';
            ctx.fillRect(curX, swatchY, swatchSize, swatchSize);

            ctx.strokeStyle = isPureWhite ? 'rgba(0, 0, 0, 0.22)' : 'rgba(0, 0, 0, 0.08)';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(curX, swatchY, swatchSize, swatchSize);

            curX += swatchSize + swatchGap;
          });

          // 7. Footer Section
          // Line 1: CRÉÉ SUR LENVRS ATELIER (Montserrat Bold)
          ctx.fillStyle = '#111111';
          ctx.font = '700 18px "Montserrat", sans-serif';
          ctx.textAlign = 'center';
          ctx.letterSpacing = '1.5px';
          ctx.fillText('CRÉÉ SUR LENVRS ATELIER', 540, 1530);

          // Line 2: ÉDITION DE @... (Montserrat SemiBold)
          const cleanHandle = instagramHandle
            ? (instagramHandle.startsWith('@') ? instagramHandle : `@${instagramHandle}`)
            : '@lenvrs.atelier';
          ctx.font = '600 18px "Montserrat", sans-serif';
          ctx.letterSpacing = '1px';
          ctx.fillText(`ÉDITION DE ${cleanHandle}`, 540, 1575);
          ctx.letterSpacing = '0px';

          resolve(canvas.toDataURL('image/png'));
        };
        img.src = snapshotDataUrl;
      };
      logoImg.src = `${import.meta.env.BASE_URL}logo.png`;
    };

    drawContent();
  });
}
