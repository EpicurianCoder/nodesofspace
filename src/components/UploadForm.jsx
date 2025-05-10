'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { createClient } from '@supabase/supabase-js';

export default function UploadForm() {
  const VISION_API = process.env.NEXT_PUBLIC_VISION_API;
  const [selectedFile, setSelectedFile] = useState(null);
  const [fullDescription, setFullDescription] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [status, setStatus] = useState('unknown');
  const [labels, setLabels] = useState(null);
  const [base64Image, setBase64Image] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [location, setLocation] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

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

  async function uploadFile(file, imagePath) {
    const { data, error } = await supabase.storage.from('nothings').upload(imagePath, file)
    if (error) {
      console.error('Error uploading file to supabase:', error);
    } else {
      console.log('File uploaded successfully to supabase:', data);
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsProcessing(true); // Disable the file input and grey out the button
    setStatus('Uploading...');

    // Convert file to base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Image = reader.result.split(',')[1];
      setBase64Image(base64Image);
      try {
        const requestBody = {
            requests: [
                {
                    image: { content: base64Image },
                    features: [
                      { type: "LABEL_DETECTION", maxResults: 30 },
                      { type: "WEB_DETECTION", maxResults : 10 }
                    ]
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
          setIsProcessing(false); // Re-enable the file input if processing fails
          return;
        }
        console.log('Response from Vision API:', data.responses[0]);
        
        const labels = data.responses[0].labelAnnotations;
        const webDetection = data.responses[0].webDetection;

        let fullDescription = '';
        fullDescription +=`Primary Identitfication Labels: \n`;
        for (const label of labels) {
            console.log(`Primary Identitfication Label: ${label.description}, Score: ${label.score}`);
            fullDescription +=`${label.description} (${(label.score * 100).toFixed(2)}%) \n`;
        }
        fullDescription +=`\nSecondary Web Detection Labels: \n`;
        for (const entity of webDetection.webEntities) {
            console.log(`Secondary Web Detection Label: ${entity.description}, Score: ${entity.score}`);
            fullDescription += `${entity.description} (${(entity.score * 100).toFixed(2)}%) \n`;
        }
        setLabels(data.responses[0].labelAnnotations);
        setStatus(`Image Processing complete! \n\n ${fullDescription}`);
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
    window.location.reload();
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
      const randomNumber = Math.floor(Math.random() * 1000000);
      const imagePath = `${labels[0].description}_${randomNumber}.jpg`;
      uploadFile(selectedFile, imagePath);
      const response = await fetch('/api/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ labels, location, quantity, imagePath }),
      });

      const data = await response.json();
  
      if (response.ok) {
        console.log(data.message);
        Swal.fire({
          title: 'Database Notification',
          text: data.message,
          icon: 'success',
          confirmButtonText: 'OK'
        });
        router.push('/graph');
      } else {
        console.error(data.message);
        Swal.fire({
          title: 'Database Notification',
          text: data.message,
          icon: 'failure',
          confirmButtonText: 'OK'
        });
        router.push('/upload');
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
          className={`upload-input ${isProcessing ? 'disabled' : ''}`}
          disabled={!!selectedFile}
        />
        <label
          htmlFor="fileUpload"
          className={`upload-label ${isProcessing ? 'disabled' : ''}`}
        >
          Choose File
        </label>
        <p className="upload-instruction">
          ...or drag and drop an image here
        </p>
        {selectedFile && <p className="upload-file-name">Uploaded File: {selectedFile.name}</p>}
      </div>
      {!labels && (
        <div className="process-action">
          <button
            onClick={handleUpload}
            className="upload-button"
          >
            Process Image
          </button>
        </div>
      )}
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
        </div>
      )}
      {labels && (
        <div className="submit-actions">
          <button onClick={handleSubmit} className="submit-button">Submit</button>
          <button onClick={handleCancel} className="cancel-button">Cancel</button>
        </div>
      )}
      {previewUrl && (
        <img
          src={previewUrl}
          alt="Selected preview"
          className="upload-preview"
        />
      )}
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
      <div className={`upload-status ${status.includes('Error') ? 'error' : status === 'unknown' || status === 'Uploading...' ? 'unknown' : 'success'} ${status ? 'visible' : ''}`}>
        {status === 'unknown' ? 'Awaiting processing...' : status || 'No status yet.'}
      </div>
    </div>
  );
}