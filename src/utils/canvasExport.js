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

// Convert RGB to Hex
function rgbToHex(r, g, b) {
  const toHex = x => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Blend two RGB colors with a specific weight
function mixRgb(rgb1, rgb2, weight) {
  return [
    rgb1[0] * (1 - weight) + rgb2[0] * weight,
    rgb1[1] * (1 - weight) + rgb2[1] * weight,
    rgb1[2] * (1 - weight) + rgb2[2] * weight
  ];
}

// Extract the lightest fabric color and generate the luxury editorial studio wash
function getLightestSoftenedTones(colors) {
  // 1. Exclude all topstitches / surpiqûres
  const fabricHexes = Object.entries(colors || {})
    .filter(([key, val]) => !key.toLowerCase().includes('topstitch') && typeof val === 'string' && val.startsWith('#'))
    .map(([, val]) => val);

  const uniqueHexes = Array.from(new Set(fabricHexes));

  if (uniqueHexes.length === 0) {
    return { c1: '#ffffff', c2: '#dce0e8' };
  }

  // 2. Sort by perceived luminance descending (absolute lightest fabric first)
  uniqueHexes.sort((a, b) => getLuminance(b) - getLuminance(a));
  const absoluteLightest = uniqueHexes[0];
  const tintRgb = hexToRgb(absoluteLightest);

  // 3. Base Illustrator Studio Satin Palette
  const base1 = [255, 255, 255]; // Pure white highlight
  const base2 = [220, 224, 232]; // Studio satin silver depth

  // If already pure white / silver, return crisp silver satin
  if (tintRgb[0] > 245 && tintRgb[1] > 245 && tintRgb[2] > 245) {
    return { c1: '#ffffff', c2: '#dce0e8' };
  }

  // 4. Inject a delicate 18% - 24% tint wash into the luxury satin base
  // This keeps the backdrop pristine and bright, preventing any muddy/mustard tones
  const c1Rgb = mixRgb(base1, tintRgb, 0.18);
  const c2Rgb = mixRgb(base2, tintRgb, 0.25);

  return {
    c1: rgbToHex(...c1Rgb),
    c2: rgbToHex(...c2Rgb)
  };
}

// Draw 4-Corner Diagonal Freeform Gradient (Illustrator Mesh Gradient style)
function drawIllustratorFreeformGradient(ctx, targetWidth, targetHeight, color1Hex, color2Hex) {
  // Diagonal 1: Top-Left (TL) & Bottom-Right (BR) -> c1 (Lightest Highlight)
  // Diagonal 2: Top-Right (TR) & Bottom-Left (BL) -> c2 (Softened Tone)
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

    // 1. Draw 4-corners diagonal Freeform Mesh Gradient with luxury silk wash
    const { c1, c2 } = getLightestSoftenedTones(colors);
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

        // 4. Draw Undistorted, Perfectly Proportioned 3D Garment
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const maxW = 960;
          const maxH = 940;
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
          const imgY = 285 + (maxH - drawH) / 2;

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
