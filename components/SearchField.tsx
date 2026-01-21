import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { SearchIcon } from "lucide-react";
import { ChangeEvent } from "react";

interface iProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: ChangeEvent) => void;
  wrapperClassName?: string;
  inputClassName?: string;
}

const SearchField = (props: iProps) => {
  return (
    <InputGroup className={props?.wrapperClassName}>
      <InputGroupInput
        placeholder={props?.placeholder}
        value={props?.value}
        onChange={props?.onChange}
        className={props?.inputClassName}
      />
      <InputGroupAddon>
        <SearchIcon className="size-4 sm:size-4.5" />
      </InputGroupAddon>
    </InputGroup>
  );
};

export default SearchField;
