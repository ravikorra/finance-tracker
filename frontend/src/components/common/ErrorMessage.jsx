import './ErrorMessage.css';

export const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div className="error-message-container">
      <div className="error-content">
        <div className="error-icon">⚠️</div>
        <p className="error-text">{message}</p>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="retry-button">
          Retry
        </button>
      )}
    </div>
  );
};
