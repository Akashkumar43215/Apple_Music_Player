import { Listbox } from "@headlessui/react";
import { FiChevronDown, FiCheck } from "react-icons/fi";

const GenreDropdown = ({
  value,
  options,
  onChange,
}) => {
  return (
    <Listbox value={value} onChange={onChange}>
      <div className="relative">

        <Listbox.Button
          className="
            w-full
            rounded-2xl
            border
            border-white/10
            bg-white/5
            px-5
            py-4
            text-left
            text-white
            backdrop-blur-xl
            transition
            hover:border-violet-400
          "
        >
          <div className="flex items-center justify-between">

            <span>{value}</span>

            <FiChevronDown />

          </div>
        </Listbox.Button>

        <Listbox.Options
          className="
absolute
bottom-full
mb-3
z-50
w-full
max-h-72
overflow-auto
rounded-2xl
border
border-white/10
bg-[#17171D]
p-2
shadow-2xl
"
        >
          {options.map((genre) => (
            <Listbox.Option
              key={genre}
              value={genre}
            >
              {({ selected, active }) => (
                <div
                  className={`
                    flex
                    cursor-pointer
                    items-center
                    justify-between
                    rounded-xl
                    px-4
                    py-3
                    transition

                    ${
                      active
                        ? "bg-violet-600"
                        : ""
                    }

                    ${
                      selected
                        ? "text-violet-300"
                        : "text-white"
                    }
                  `}
                >
                  <span>{genre}</span>

                  {selected && (
                    <FiCheck />
                  )}
                </div>
              )}
            </Listbox.Option>
          ))}
        </Listbox.Options>

      </div>
    </Listbox>
  );
};

export default GenreDropdown;