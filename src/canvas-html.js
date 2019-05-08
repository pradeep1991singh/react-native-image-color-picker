export const canvasHtml = (imageBlob, options) => {
  const optionsString = JSON.stringify(options);
  return `
      <!DOCTYPE html>
      <html>
      <script>
      function getColorPalettes(options) {
        const {
          imageType = 'jpeg',
          paletteCount = 3,
          defaultPalette = [0, 0, 0, 1],
          paletteType = 'dominant',
          colorType = 'rgba'
        } = options;
  
        const imageElement = document.getElementById('__colorPickerCanvasImage');      
        const canvas = document.createElement('canvas');
        const	canvasContext = canvas.getContext && canvas.getContext('2d');
  
        if (!canvasContext) return defaultPalette;
        
        let imageWidth = canvas.width = imageElement.naturalWidth 
          || imageElement.offsetWidth 
          || imageElement.width;                
  
        const imageHeight = canvas.height = imageElement.naturalHeight 
          || imageElement.offsetHeight 
          || imageElement.height;                   
  
        canvasContext.drawImage(imageElement, 0, 0);
        
        let palette = [];
        if (paletteType === 'average')
          palette = getAveragePalette({imageWidth, imageHeight, canvasContext, colorType});
        else
          palette = getDominantPalettes(getAllPalettes(imageWidth, imageHeight, canvasContext), paletteCount, colorType);
  
        window.ReactNativeWebView.postMessage(JSON.stringify({'message':'imageColorPicker','payload':palette}));        
      }
  
      function getAveragePalette({imageWidth, imageHeight, canvasContext, colorType = 'rgb'}) {
        const blockSize = 5
        let i = -4;
        let count = 0;
        let red = green = blue = 0, alpha = 1;      
        
        try {
          data = canvasContext.getImageData(0, 0, imageWidth, imageHeight);
        } catch(e) {
          console.log(e);
        }
      
        while ((i += blockSize * 4) < data.data.length) {
          ++count;
          red += data.data[i];
          green += data.data[i+1];
          blue += data.data[i+2];
        }
  
        red = ~~(red/count);
        green = ~~(green/count);
        blue = ~~(blue/count);
        if (colorType === 'hex')
          return [[rgbToHex([red, green, blue])]]
        else
          return [[red, green, blue, alpha]];
      }
  
      function rgbToHex(rgba) {
        let hexColor = '#';
        rgba.slice(0, 3).forEach(c => {
          let hex = c.toString(16);
          hexColor += hex.length == 1 ? '0' + hex : hex;  
        });
        return hexColor
      }
  
      function getAllPalettes(width, height, context) {
        let distinctPalettes = [];        
        for (let i=0; i<=height; i++) { 
          for (let j=0; j<=width; j++) { 
            try {
              data = context.getImageData(i, j, 1, 1);
              if (data.data.toString().trim() !== '0,0,0,0') {
                distinctPalettes.push(data.data);
              }
            } catch(e) {
              console.log(e);
            }
          }
        }  
        return distinctPalettes;
      }
  
      function getDominantPalettes(allPalettes, distinctCount, colorType = 'rgb') {
        const combinations = getPaletteOccurrences(allPalettes);
        let palettes = combinations[0];
        let occurrences = combinations[1];
        const dominantPalettes = [];
  
        while (distinctCount) {               
          let dominant = 0, dominantKey = 0;  
          occurrences.forEach((v, k) => {           
            if (v > dominant) {
              dominant = v;              
              dominantKey = k;                               
            }
          });
          if (colorType === 'hex')
            dominantPalettes.push(rgbToHex(palettes[dominantKey]));
          else
            dominantPalettes.push(palettes[dominantKey]);
            
          palettes.splice(dominantKey, 1);            
          occurrences.splice(dominantKey, 1);
          distinctCount--;
        }
        return dominantPalettes;
      }        
  
      function getPaletteOccurrences(palettes) {
        let paletteList = [], occurrenceList = [], previousPalette;
        palettes.sort();
        palettes.forEach((palette, key) => {
          if (palette.toString() !== previousPalette) {
            paletteList.push(palette);
            occurrenceList.push(1);
          } else {
            occurrenceList[occurrenceList.length-1]++;
          }
          previousPalette = palettes[key].toString();
        });
        return [paletteList, occurrenceList];
      }
  
      const interval = setInterval(() => {
        const img = document.getElementById('__colorPickerCanvasImage');
        if (img.src.length != 0) {
          getColorPalettes(${optionsString});
          clearInterval(interval);
        }
      }, 10);        
  
      </script>
      <body>
        <img src='data:image/${options.imageType};base64,${imageBlob}' 
          width='${options.imageWidth}px'
          height='${options.imageHeight}px'
          id='__colorPickerCanvasImage' 
          onload='getColorPalettes(${optionsString})'/>
      </body>
      </html>
    `;
};
