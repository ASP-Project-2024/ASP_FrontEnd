<<<<<<< HEAD
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
=======
const LanguageSelector = ({ options, selected, onSelect }) => (
    <select
        value={selected.value}
        onChange={(e) => onSelect(options.find((opt) => opt.value === e.target.value))}
    >
        {options.map((option) => (
            <option key={option.value} value={option.value}>
                {option.label}
            </option>
        ))}
    </select>
);
>>>>>>> abc7a35846dc1d2b5b4c5e54c638d6c494ccf59f

export default LanguageSelector;
