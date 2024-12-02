import React, { useState } from "react";
import "./LanguageSelector.css"; // Assuming this file exists for styling
import { LANGUAGE_VERSIONS } from "../constants";

const LanguageSelector = ({ language, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);

    return (
        <div className="language-selector">
            <button className="menu-button" onClick={toggleMenu}>
                {language || "Select Language"}
            </button>
            {isOpen && (
                <ul className="menu-list">
                    {Object.entries(LANGUAGE_VERSIONS).map(([language]) => (
                        <li
                            key={language}
                            className="menu-item"
                            onClick={() => {
                                onSelect(language);
                                setIsOpen(false); // Close the menu after selection
                            }}
                        >
                            
                            {language.charAt(0).toUpperCase() + language.slice(1)}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default LanguageSelector;
