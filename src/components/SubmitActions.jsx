export default function SubmitActions({ handleSubmit, handleCancel }) {
    return (
        <div className="submit-actions">
            <button onClick={handleSubmit} className="submit-button">Submit</button>
            <button onClick={handleCancel} className="cancel-button">Cancel</button>
        </div>
    );
}

