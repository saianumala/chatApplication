interface InputCardProps {
  name?: string;
  type: string;
  value?: string;
  className?: string;
  placeholder?: string;
  labelTitle?: string;
  onChange?: (e: any) => void;
}
export default function InputCard({
  name,
  type,
  value,
  className,
  placeholder,
  labelTitle,
  onChange,
}: InputCardProps) {
  console.log(labelTitle);
  return (
    <>
      <div className="flex flex-col gap-1">
        {labelTitle !== undefined && (
          <label htmlFor={name}>{labelTitle} </label>
        )}

        <input
          onChange={onChange}
          name={name}
          type={type}
          value={value}
          className={className}
          placeholder={placeholder}
        />
      </div>
    </>
  );
}
