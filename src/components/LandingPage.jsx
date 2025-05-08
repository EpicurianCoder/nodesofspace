import React from 'react';

export default function LandingPage() {
  const steps = [
    "Click on 'Add Node' to begin building the graph",
    "Upload an image by dragging and dropping or choosing a file",
    "Process the image for recognition and categorization",
    "Indicate location and quantity",
    "Submit to the database",
    "Watch the node graph build its connections",
    "Delete and edit nodes using the UI",
  ];

  return (
    <div className="landing-page">
      <h1 className="landing-title">Welcome to Nodes of Space</h1>
      <p className="landing-subtitle">Follow these steps to get started:</p>
      <div className="steps-container">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`step ${index % 2 === 0 ? 'step-left' : 'step-right'}`}
          >
            <div className="step-number">{index + 1}</div>
            <p className="step-text">{step}</p>
          </div>
        ))}
      </div>
    </div>
  );
}