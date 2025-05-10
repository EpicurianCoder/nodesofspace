export default function FileUpload({ selectedFile, setSelectedFile, setPreviewUrl, isProcessing }) {
    const handleFileChange = (e) => {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (file) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setPreviewUrl('');
      }
    };
  
    const handleDragOver = (e) => {
      e.preventDefault();
    };
  
    const handleDrop = (e) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) {
        setSelectedFile(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      }
    };
  
    return (
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`upload-drop-zone ${selectedFile ? 'dragging' : ''}`}
      >
        <input
          type="file"
          id="fileUpload"
          accept="image/*"
          onChange={handleFileChange}
          className={`upload-input ${isProcessing ? 'disabled' : ''}`}
          disabled={!!selectedFile || isProcessing}
        />
        <label
          htmlFor="fileUpload"
          className={`upload-label ${isProcessing ? 'disabled' : ''}`}
        >
          Choose File
        </label>
        <p className="upload-instruction">...or drag and drop an image here</p>
        {selectedFile && <p className="upload-file-name">Uploaded File: {selectedFile.name}</p>}
      </div>
    );
  }