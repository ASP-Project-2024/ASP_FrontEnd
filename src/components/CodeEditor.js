import { useState, useEffect, useRef } from "react";
import Prism from "prismjs";
import "prismjs/themes/prism-okaidia.css"; // Syntax highlighting theme
import LanguageSelector from "./LanguageSelector";
import "./CodeEditor.css";

// Supported languages in Prism.js
const LANGUAGE_OPTIONS = [
    { label: "Python 3.9.4", value: "python", version: "3.9.4" },
    { label: "JavaScript 20.11.1", value: "javascript", version: "20.11.1" },
    { label: "Java 15.0.2", value: "java", version: "15.0.2" },
    { label: "C++ (GCC 10.2.0)", value: "cpp", version: "10.2.0" },
];

// Default code snippets for each language
const CODE_SNIPPETS = {
    python: `print("Hello, Python!")`,
    javascript: `console.log("Hello, JavaScript!");`,
    java: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, Java!");\n    }\n}`,
    cpp: `#include <iostream>\n\nusing namespace std;\n\nint main() {\n    cout << "Hello, C++!" << endl;\n    return 0;\n}`,
    csharp: `using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello, C#!");\n    }\n}`
};


const CodeEditor = () => {
    const [code, setCode] = useState(CODE_SNIPPETS.python);
    const [output, setOutput] = useState("");
    const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGE_OPTIONS[0]);
    const codeRef = useRef(null);

    // Apply syntax highlighting whenever code or language changes
    useEffect(() => {
        Prism.highlightAll();
    }, [code, selectedLanguage]);

    // Handle language selection
    const onSelectLanguage = (language) => {
        setSelectedLanguage(language);
        setCode(CODE_SNIPPETS[language.value]); // Set default code for selected language
        setOutput(""); // Clear output when language changes
    };

    const executeCode = async () => {
        const payload = {
            language: selectedLanguage.value,
            version: selectedLanguage.version,
            files: [{ name: "main", content: code }],
        };
    
        try {
            const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/code/execute-code`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
    
            if (response.ok) {
                const result = await response.json();
                console.log("Execution Result:", result);
    
                // Store the output if the response has a valid result
                if (result?.result.run?.output) {
                    setOutput(result.result.run.output);
                } else {
                    setOutput("No output");
                }
            } else {
                setOutput(`Error: ${response.status} - ${response.statusText}`);
                console.error("Error Response:", response);
            }
        } catch (error) {
            setOutput("Error executing code. Please try again.");
            console.error("Error executing code:", error);
        }
    };
    
    

    // Handle code editing
    const handleCodeChange = (e) => {
        setCode(e.target.value);
    };

    // Handle resetting the editor
    const resetEditor = () => {
        setCode(CODE_SNIPPETS[selectedLanguage.value]); // Reset code to default snippet
        setOutput(""); // Clear output
    };

    return (
        <div className="code-editor-wrapper">
            <div className="code-editor-header">
                <LanguageSelector
                    options={LANGUAGE_OPTIONS}
                    selected={selectedLanguage}
                    onSelect={onSelectLanguage}
                />
            </div>
            <div className="code-editor-container">
                {/* Code Input Section with Syntax Highlighting */}
                <div className="code-input">
                    <pre className="code-output">
                        <code
                            className={`language-${selectedLanguage.value}`}
                            ref={codeRef}
                        >
                            {code}
                        </code>
                    </pre>
                    <textarea
                        className="code-textarea"
                        value={code}
                        onChange={handleCodeChange}
                        spellCheck={false}
                    />
                </div>
                {/* Output Section */}
                <div className="output-container">
                    <div className="buttons-container">
                        <button className="run-button" onClick={executeCode}>
                            Run Code
                        </button>
                        <button className="reset-button" onClick={resetEditor}>
                            Reset
                        </button>
                    </div>
                    <div className="output-display">
                        <pre>{output}</pre>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CodeEditor;
