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

export default LanguageSelector;
