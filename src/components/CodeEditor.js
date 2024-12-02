import Editor from "@monaco-editor/react";
import { useRef, useState } from "react";
import LanguageSelector from "./LanguageSelector";
import { CODE_SNIPPETS } from "../constants";
import './CodeEditor.css'
import Output from "./Output";

const CodeEditor = () => {
    const editorRef = useRef();
    const [value, setValue] = useState('');
    const [language, setLanguage] = useState('java');

    const onMount = (editor) => {
        editorRef.current = editor;
        editor.focus();
    };

    const onSelect = (language) => {
        setLanguage(language);
        setValue(CODE_SNIPPETS[language]);
    };

    return (
        <div className="code-editor-wrapper">
            <div className="code-editor-container">
                <LanguageSelector language={language} onSelect={onSelect} />
                <Editor
                    height="80vh"
                    theme="vs-dark"
                    language={language}
                    defaultValue={CODE_SNIPPETS[language]}
                    value={value}
                    onChange={(value) => setValue(value)}
                    onMount={onMount}
                />
            </div>
            <div className="output-container">
                <Output  editorRef={editorRef} language={language}/>
            </div>
        </div>
    );
};

export default CodeEditor;
