import { FiSearch } from "react-icons/fi";

const SearchInput = ({
    value,
    onChange,
    placeholder
}) => {

    return (

        <div className="relative">

            <FiSearch

                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"

            />

            <input

                value={value}

                onChange={onChange}

                placeholder={placeholder}

                className="

                w-full

                rounded-2xl

                border

                border-white/10

                bg-white/5

                py-4

                pl-12

                pr-4

                text-white

                placeholder:text-white/40

                outline-none

                transition

                focus:border-violet-500

                "

            />

        </div>

    )

}

export default SearchInput;