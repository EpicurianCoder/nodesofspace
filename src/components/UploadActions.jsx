export default function UploadActions({ location, setLocation, quantity, setQuantity }) {
    return (
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
    );
  }