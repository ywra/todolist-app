import React from 'react';
import './Input.css';

interface InputProps {
  label?: string;
  type?: 'text' | 'email' | 'password' | 'date';
  error?: string;
  placeholder?: string;
  required?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;
}

export default function Input({
  label,
  type = 'text',
  error,
  placeholder,
  required = false,
  value,
  onChange,
  name,
}: InputProps) {
  return (
    <div className="input-field">
      {label ? (
        <label className="input-label">
          {label}
          {required ? <span className="input-required"> *</span> : null}
        </label>
      ) : null}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`input-control ${error ? 'input-error' : ''}`}
      />
      {error ? <span className="input-error-msg">{error}</span> : null}
    </div>
  );
}
