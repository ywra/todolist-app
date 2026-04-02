import React from 'react';
import './TextArea.css';

interface TextAreaProps {
  label?: string;
  error?: string;
  placeholder?: string;
  maxLength?: number;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  name?: string;
}

export default function TextArea({
  label,
  error,
  placeholder,
  maxLength,
  value,
  onChange,
  name,
}: TextAreaProps) {
  return (
    <div className="textarea-field">
      {label ? <label className="textarea-label">{label}</label> : null}
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`textarea-control ${error ? 'textarea-error' : ''}`}
      />
      <div className="textarea-footer">
        {error ? <span className="textarea-error-msg">{error}</span> : <span />}
        {maxLength !== undefined && value !== undefined ? (
          <span className="textarea-count">{value.length}/{maxLength}</span>
        ) : null}
      </div>
    </div>
  );
}
