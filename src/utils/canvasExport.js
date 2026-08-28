// Calculate perceived luminance (ITU-R BT.709)
function getLuminance(hex) {
  if (!hex || typeof hex !== 'string') return 0;
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  if (c.length !== 6) return 0;
  const r = parseInt(c.substr(0, 2), 16) / 255;
  const g = parseInt(c.substr(2, 2), 16) / 255;
  const b = parseInt(c.substr(4, 16), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Adjust lightness of a hex color
function adjustHexLightness(hex, delta) {
  if (!hex || typeof hex !== 'string') return hex;
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  if (c.length !== 6) return hex;
  
  let r = parseInt(c.substr(0, 2), 16);
  let g = parseInt(c.substr(2, 2), 16);
  let b = parseInt(c.substr(4, 2), 16);
  
  r = Math.max(0, Math.min(255, Math.round(r + delta * 255)));
  g = Math.max(0, Math.min(255, Math.round(g + delta * 255)));
  b = Math.max(0, Math.min(255, Math.round(b + delta * 255)));
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Extract the 2 lightest colors selected on the garment
function getTwoLightestColors(colors) {
  const allHexes = Object.values(colors || {}).filter(c => typeof c === 'string' && c.startsWith('#'));
  const uniqueHexes = Array.from(new Set(allHexes));

  if (uniqueHexes.length === 0) {
    return ['#ffffff', '#dadde3'];
  }

  // Sort by perceived luminance descending (lightest first)
  uniqueHexes.sort((a, b) => getLuminance(b) - getLuminance(a));

  const lightest = uniqueHexes[0];
  let secondLightest = uniqueHexes[1] || adjustHexLightness(lightest, -0.12);

  // If both colors are almost identical pure white, provide elegant silver studio gradient
  if (getLuminance(lightest) > 0.96 && getLuminance(secondLightest) > 0.96) {
    return ['#ffffff', '#dadde3'];
  }

  return [lightest, secondLightest];
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

    // 1. Draw dynamic studio gradient using the 2 lightest colors selected
    const [color1, color2] = getTwoLightestColors(colors);

    const bgGradient = ctx.createLinearGradient(0, 0, 1080, 1920);
    bgGradient.addColorStop(0.0, color2);
    bgGradient.addColorStop(0.26, color1);
    bgGradient.addColorStop(0.65, color2);
    bgGradient.addColorStop(1.0, adjustHexLightness(color2, -0.06));

    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 1080, 1920);

    // Soft central glow layer for satin studio depth
    const radialGlow = ctx.createRadialGradient(540, 650, 80, 540, 650, 780);
    radialGlow.addColorStop(0.0, 'rgba(255, 255, 255, 0.28)');
    radialGlow.addColorStop(0.5, 'rgba(255, 255, 255, 0.08)');
    radialGlow.addColorStop(1.0, 'rgba(0, 0, 0, 0.04)');

    ctx.fillStyle = radialGlow;
    ctx.fillRect(0, 0, 1080, 1920);

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
