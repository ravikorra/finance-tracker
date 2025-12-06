import { useState, useEffect, useRef } from 'react';
import './AutocompleteInput.css';

/**
 * AutocompleteInput Component
 * Provides search suggestions as user types
 */
const AutocompleteInput = ({
  value,
  onChange,
  onSelect,
  placeholder,
  searchFunction,
  displayKey = 'name',
  minChars = 2,
  debounceMs = 300,
  disabled = false
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [inputValue, setInputValue] = useState(value || '');
  
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const debounceTimer = useRef(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update input value when prop changes
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  // Search for suggestions
  const performSearch = async (query) => {
    if (query.length < minChars) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    setIsLoading(true);
    try {
      const results = await searchFunction(query);
      setSuggestions(results);
      // Always show dropdown if query is long enough, even if no results
      setShowDropdown(true);
    } catch (error) {
      console.error('Search error:', error);
      setSuggestions([]);
      setShowDropdown(true); // Show dropdown to display manual entry option
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change with debounce
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setSelectedIndex(-1);
    
    // Call parent onChange
    if (onChange) {
      onChange(e);
    }

    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer for search
    debounceTimer.current = setTimeout(() => {
      performSearch(newValue);
    }, debounceMs);
  };

  // Handle manual entry when no results found
  const handleManualEntry = () => {
    setShowDropdown(false);
    setSuggestions([]);
    // The inputValue is already set, just close dropdown
    if (onSelect) {
      onSelect({ schemeName: inputValue, schemeCode: '', isManual: true });
    }
  };

  // Handle suggestion selection
  const handleSelect = (suggestion) => {
    const displayValue = typeof suggestion === 'object' 
      ? suggestion[displayKey] 
      : suggestion;
    
    setInputValue(displayValue);
    setShowDropdown(false);
    setSuggestions([]);
    
    if (onSelect) {
      onSelect(suggestion);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showDropdown || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelect(suggestions[selectedIndex]);
        }
        break;
      
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
      
      default:
        break;
    }
  };

  return (
    <div className="autocomplete-wrapper" ref={wrapperRef}>
      <div className="autocomplete-input-container">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="autocomplete-input"
          autoComplete="off"
        />
        {isLoading && (
          <div className="autocomplete-loading">
            <div className="spinner"></div>
          </div>
        )}
      </div>

      {showDropdown && (
        <div className="autocomplete-dropdown">
          {suggestions.length > 0 ? (
            <>
              {suggestions.map((suggestion, index) => {
                const displayValue = typeof suggestion === 'object'
                  ? suggestion[displayKey]
                  : suggestion;
                
                return (
                  <div
                    key={suggestion.schemeCode || index}
                    className={`autocomplete-item ${
                      index === selectedIndex ? 'selected' : ''
                    }`}
                    onClick={() => handleSelect(suggestion)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    {displayValue}
                  </div>
                );
              })}
            </>
          ) : inputValue.length >= minChars && !isLoading ? (
            <div className="autocomplete-no-results">
              <div className="no-results-text">No mutual funds found</div>
              <button 
                className="manual-entry-btn"
                onClick={handleManualEntry}
                type="button"
              >
                ➕ Add "{inputValue}" manually
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default AutocompleteInput;
