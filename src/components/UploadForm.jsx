'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

export default function UploadForm() {
  const VISION_API = process.env.NEXT_PUBLIC_VISION_API;
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [status, setStatus] = useState('unknown');
  const [labels, setLabels] = useState(null);
  const [base64Image, setBase64Image] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [location, setLocation] = useState('');
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();

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
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setStatus('Uploading...');

    // Convert file to base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Image = reader.result.split(',')[1]; // Remove data:image/...;base64,
      setBase64Image(base64Image);
      try {
        const requestBody = {
            requests: [
                {
                    image: { content: base64Image },
                    features: [{ type: "LABEL_DETECTION", maxResults: 10 }]
                }
            ]
        };
        const image = { content: base64Image };
        // log vision API key
        console.log('Vision API Key:', VISION_API);
        const res = await fetch(VISION_API, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });
        const data = await res.json();
        if (!data.responses || !data.responses[0].labelAnnotations) {
          setStatus('Image not recognized');
          return;
        }
        console.log('Response from Vision API:', data.responses[0]);
        
        const labels = data.responses[0].labelAnnotations;

        let full_description = '';
        for (const label of labels) {
            console.log(`Label: ${label.description}, Score: ${label.score}`);
            full_description += `${label.description} (${(label.score * 100).toFixed(2)}%) \n`;
        }
        setLabels(data.responses[0].labelAnnotations);
        setStatus(`Upload complete! \n\n ${full_description}`);
      } catch (err) {
        setStatus('Error uploading image');
        console.error(err);
      }
    };

    reader.readAsDataURL(selectedFile);
  };

  // Clean up the object URL when component unmounts or file changes
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleCancel = () => {
    router.push('/');
  };

  const handleSubmit = async () => {
    if (!labels) {
      Swal.fire({
        title: 'Image Indentification',
        text: 'No labels to submit!',
        icon: 'failure',
        confirmButtonText: 'OK'
      });
      return;
    }
    try {
      const response = await fetch('/api/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ labels, location, base64Image, quantity }), // Send the labels as JSON
      });

      const data = await response.json();
      // const labels_new = data.processedData.labelAnnotations;
      // console.log('Response from API:', labels_new);
  
      if (response.ok) {
        console.log(data.message); // Print the message to the console
        Swal.fire({
          title: 'Database Notification',
          text: data.message,
          icon: 'success',
          confirmButtonText: 'OK'
        });
        router.push('/graph'); // Navigate back to the graph
      } else {
        console.error(data.message); // Print error message to the console
        Swal.fire({
          title: 'Database Notification',
          text: data.message,
          icon: 'failure',
          confirmButtonText: 'OK'
        });
        router.push('/upload'); // Navigate back to the upload start
      }
    } catch (error) {
      console.error('Error submitting labels:', error);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <div className="upload-form">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`upload-drop-zone ${isDragging ? 'dragging' : ''}`}
      >
        <input
          type="file"
          id="fileUpload"
          accept="image/*"
          onChange={handleFileChange}
          className="upload-input"
        />
        <label
          htmlFor="fileUpload"
          className="upload-label"
        >
          Choose File
        </label>
        <p className="upload-instruction">
          ...or drag and drop an image here
        </p>
        {selectedFile && <p className="upload-file-name">Uploaded File: {selectedFile.name}</p>}
      </div>
      {previewUrl && (
        <img
          src={previewUrl}
          alt="Selected preview"
          className="upload-preview"
        />
      )}
      <button
        onClick={handleUpload}
        className="upload-button"
      >
        Process Image
      </button>
      <div className={`base64-output ${base64Image ? 'visible' : ''}`}>
        <h3 className="base64-title">Base64 Representation</h3>
        <div className="base64-container">
          <textarea
            readOnly
            value={base64Image || ''}
            className="base64-textarea"
          />
        </div>
      </div>
      <div className={`upload-status ${status.includes('Error') ? 'error' : status === 'unknown' || status === 'Uploading...' ? 'unknown' : 'success'}`}>
        {status === 'unknown' ? 'Awaiting processing...' : status || 'No status yet.'}
      </div>
      {labels && (
        <div className="upload-actions">
          <label htmlFor="location" className="location-label">Location:</label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="location-input"
            placeholder="Enter location"
          />
          <label htmlFor="quantity" className="quantity-label">Quantity:</label>
          <input
            type="number"
            id="quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="quantity-input"
            placeholder="Enter quantity"
          />
          <button
            onClick={handleSubmit}
            className="submit-button"
          >
            Submit
          </button>
          <button
            onClick={handleCancel}
            className="cancel-button"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}