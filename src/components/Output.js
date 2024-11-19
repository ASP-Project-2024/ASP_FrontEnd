import React, { useState } from 'react'
import './Output.css'
import { executeCode } from '../api'

const Output = ({ editorRef, language }) => {
    const [output,setOutput] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isError, setisError] = useState(false)

    const runCode = async () => {
        const sourceCode = editorRef.current.getValue()
        if (!sourceCode) return
        try {
            setIsLoading(true)
            const {run:result } = await executeCode(language, sourceCode)
            setOutput(result.output.split("\n"))
            result.stderr ? setisError(true) : setisError(false)
        } catch (error) {
            
        }finally{
            setIsLoading(false)
        }
    }
    return (
        <><div className="output-container"></div>
            <button className="output-button" 
            isLoading={isLoading} 
             onClick={runCode}>
                Run Code
            </button>
            <div className='output-box'>
                {
                    output ? output.map(
                        (line,i) => <div key={i}>{line}</div>
                    ) : "Click Run Code to see the output"
                } 
            </div>

        </>
    )
}

export default Output;
