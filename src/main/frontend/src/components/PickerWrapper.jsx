import Picker from "react-mobile-picker";

export default function PickerWrapper({
	valueGroups,
	optionGroups,
	onChange,
	className = "",
}) {
	const handleChange = (name, value) => {
		onChange(name, value);
	};

	return (
		<Picker
			className={`custom-picker ${className}`}
			value={valueGroups}
			onChange={handleChange}
			height={144}
			itemHeight={48}
			wheelMode="natural"
		>
			{Object.entries(optionGroups).map(([name, options]) => (
				<Picker.Column key={name} name={name}>
					{options.map((option) => (
						<Picker.Item key={option} value={option}>
							{option}
						</Picker.Item>
					))}
				</Picker.Column>
			))}
		</Picker>
	);
}
