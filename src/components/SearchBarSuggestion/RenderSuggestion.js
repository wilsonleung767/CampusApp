import React,{useEffect} from "react";
import './RenderSuggestion.css'

const RenderSuggestions = ({suggestions, activeInput, showOriginSearch,selectPlace}) =>{
    if (suggestions.length === 0 || !activeInput) return null;

    return (
      <div className="suggestions-container">
        {suggestions.map((suggestion, index) => (
          <div key={suggestion + index} className="suggestion-item"
               onClick={() => selectPlace(suggestion,activeInput ==="origin", showOriginSearch )}>
            {suggestion}
          </div>
        ))}
      </div>
    );

}

export default RenderSuggestions;