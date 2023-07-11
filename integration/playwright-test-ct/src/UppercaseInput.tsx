import React, { useState } from 'react';

const UppercaseInput = () => {
    const [inputText, setInputText] = useState('');

    const handleChange = (e) => {
        setInputText(e.target.value);
    };

    return (
        <div className={'example-input'}>
            <input type="text" value={inputText} onChange={handleChange} />
            <p className={'output'}>{inputText.toUpperCase()}</p>
        </div>
    );
};

export default UppercaseInput;
