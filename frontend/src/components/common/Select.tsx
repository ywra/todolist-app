import React from 'react';
import './Select.css';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  options: SelectOption[];
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  placeholder?: string;
  name?: string;
}

export default function Select({
  label,
  options,
  value,
  onChange,
  placeholder,
  name,
}: SelectProps) {
  return (
    <div className="select-field">
      {label ? <label className="select-label">{label}</label> : null}
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="select-control"
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
