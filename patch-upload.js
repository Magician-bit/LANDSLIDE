const fs = require('fs');
let code = fs.readFileSync('src/components/AiImageAssessmentModal.tsx', 'utf8');

const compressionLogic = `
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setAnalysisStatus('ERROR');
        setAnalysisError('Image too large (max 10MB). Please select a smaller file.');
        return;
      }
      setImageFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setSelectedImage(compressedDataUrl);
          setAnalysisResult(null);
          setAnalysisStatus('IDLE');
          setSubmittedSuccessfully(false);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };
`;

code = code.replace(/const handleFileUpload = \\(e: React\\.ChangeEvent<HTMLInputElement>\\) => \\{[\\s\\S]*?reader\\.readAsDataURL\\(file\\);\\n    \\}\\n  \\};/, compressionLogic.trim());

fs.writeFileSync('src/components/AiImageAssessmentModal.tsx', code);
