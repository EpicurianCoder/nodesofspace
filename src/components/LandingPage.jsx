import React from 'react';
import { FaNetworkWired } from 'react-icons/fa';
import Link from 'next/link';

export default function LandingPage() {
  const steps = [
    [
      "Add your first node",
      "Begin by clicking 'Add Node' to create a new item in the graph. This establishes a unique entry you can enrich with images, data, and metadata, forming the foundation for later connections."
    ],
    [
      "Upload an image for recognition",
      "Drag and drop or select a file to associate a visual reference with your node. This image will be used for recognition and can help contextualize the data both visually and semantically."
    ],
    [
      "Set location and quantity",
      "Specify where this node exists in your domain—spatially, logically, or otherwise—and indicate quantity if relevant. This adds contextual detail that improves graph accuracy and node relevance."
    ],
    [
      "Submit Entry to Database",
      "Submit the node and its associated data to the underlying database. This action stores the entry and integrates it into the broader data model for future queries and graph computation."
    ],
    [
      "View generated connections",
      "Once submitted, the graph automatically updates to show how your new node links to existing ones based on shared tags and categories. This visualizes relationships and uncovers hidden structures."
    ],
    [
      "Edit or remove as needed",
      "Use the interface to update node content, adjust tags, or delete entries. This ensures the data remains accurate, relevant, and reflects the evolving structure of your dataset."
    ]
  ];

  return (
    <div className="landing-page">
      <h1 className="landing-title">Welcome to Nodes of Space</h1>
      <p className="landing-subtitle">This interactive node graph functions as both a visual database interface and an analytical tool. It enables users to manage entries while dynamically revealing relationships through shared categories and tags. <br/><br/>Designed for clarity and scalability, it transforms complex data structures into intuitive, navigable networks—ideal for building knowledge systems, mapping ideas, and analyzing interconnected information.</p>
      <div className="step-intro-container">
        <h3 className="step-by-step">Follow the step-by-step instructions to get started</h3>
      </div>
      <div className="button-container">
          <Link href="/graph" className="get-started-button">
            <FaNetworkWired/>Get Started
          </Link>
      </div>
      <div className="steps-container">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`step ${index % 2 === 0 ? 'step-left' : 'step-right'}`}
          >
            <div className="step-number">{index + 1}</div>
            <p className="step-text-1">{step[0]}</p>
            <p className="step-text-2">{step[1]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}