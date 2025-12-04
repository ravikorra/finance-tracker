import './Header.css';

export const Header = ({ onExport, onImport, onRefresh }) => {
  const handleImportClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = onImport;
    input.click();
  };

  return (
    <header className="app-header">
      <h1 className="app-title">
        <span className="app-icon">💰</span>
        Finance Tracker
      </h1>
      <div className="header-actions">
        <button onClick={onExport} className="header-btn">
          Export
        </button>
        <button onClick={handleImportClick} className="header-btn">
          Import
        </button>
        <button onClick={onRefresh} className="header-btn refresh-btn" title="Refresh Data">
          ↻
        </button>
      </div>
    </header>
  );
};
