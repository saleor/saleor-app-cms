import { Checkbox, FormControlLabel } from "@material-ui/core";
import { useController } from "react-hook-form";

const AppFormCheckbox = ({ options, ...rest }) => {
  const { field } = useController(rest);
  const { value, onChange } = field;

  return options.map((option) => {
    return (
      <FormControlLabel
        key={option.name}
        value={option.name}
        label={option.name}
        control={
          <Checkbox
            checked={value.some((formOption) => formOption[1] === option.name)}
            onChange={(e) => {
              const valueCopy = [...value];
              if (e.target.checked) {
                valueCopy.push([rest.parent, option.name, true]); // append to array
              } else {
                const idx = valueCopy.findIndex((formOption) => formOption[1] === option.name);
                valueCopy.splice(idx, 1); // remove from array
              }
              onChange(valueCopy); // update form field with new array
            }}
          />
        }
      />
    );
  });
};

export default AppFormCheckbox;
