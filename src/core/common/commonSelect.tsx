import Select from "react-select";

export type Option = {
  value: string;
  label: string;
};

export interface SelectProps {
  options: Option[];
  value?: Option | null;
  defaultValue?: Option;
  className?: string;
  styles?: any;
  placeholder?: string;
  onChange?: (option: Option) => void;
}

const CommonSelect: React.FC<SelectProps> = ({
  options,
  value,
  defaultValue,
  className,
  placeholder = "Select",
  onChange,
}) => {
  return (
    <Select
      classNamePrefix="react-select"
      className={className}
      options={options}
      value={value !== undefined ? value : defaultValue}
      defaultValue={defaultValue}
      onChange={(opt) => onChange?.(opt as Option)}
      placeholder={placeholder}
    />
  );
};

export default CommonSelect;
