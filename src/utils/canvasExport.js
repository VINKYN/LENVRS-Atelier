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

    // 1. Load the official background texture
    const bgImg = new Image();
    bgImg.crossOrigin = 'anonymous';

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

    bgImg.onload = () => {
      ctx.drawImage(bgImg, 0, 0, 1080, 1920);
      drawContent();
    };

    bgImg.onerror = () => {
      const bgGradient = ctx.createLinearGradient(0, 0, 1080, 1920);
      bgGradient.addColorStop(0.0, '#dadde3');
      bgGradient.addColorStop(0.25, '#eff1f5');
      bgGradient.addColorStop(0.65, '#d3d6dd');
      bgGradient.addColorStop(1.0, '#b8bcc5');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, 1080, 1920);
      drawContent();
    };

    bgImg.src = `${import.meta.env.BASE_URL}story-background.png`;
  });
}
