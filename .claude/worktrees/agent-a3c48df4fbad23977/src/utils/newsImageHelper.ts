// utils/newsImageHelper.ts
export interface ImageData {
  file: File;
  position: number;
  url?: string;
}

export function extractImagesFromHTML(htmlContent: string): { cleanedHtml: string; images: ImageData[] } {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;
  
  const images = tempDiv.querySelectorAll('img');
  const imageData: ImageData[] = [];
  
  images.forEach((img, index) => {
    const src = img.getAttribute('src');
    if (src && src.startsWith('data:image')) {
      // Converter base64 para File
      const file = dataURLToFile(src, `content-image-${index}.png`);
      imageData.push({
        file,
        position: index,
        url: src
      });
      
      // Substituir src por um placeholder temporário
      img.setAttribute('data-temp-id', `temp-${index}`);
      img.removeAttribute('src');
    }
  });
  
  return {
    cleanedHtml: tempDiv.innerHTML,
    images: imageData
  };
}

export function dataURLToFile(dataURL: string, filename: string): File {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}