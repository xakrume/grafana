import { CSSObjectWithLabel } from 'react-select';

export default function resetSelectStyles() {
  return {
    clearIndicator: () => ({}),
    container: () => ({}),
    control: () => ({}),
    dropdownIndicator: () => ({}),
    group: () => ({}),
    groupHeading: () => ({}),
    indicatorsContainer: () => ({}),
    indicatorSeparator: () => ({}),
    input: function (originalStyles: CSSObjectWithLabel) {
      return {
        ...originalStyles,
        color: 'inherit',
        // Set an explicit z-index here to ensure this element overlays singleValue
        zIndex: 1,
      };
    },
    loadingIndicator: () => ({}),
    loadingMessage: () => ({}),
    menu: () => ({}),
    menuList: ({ maxHeight }: { maxHeight: number }) => ({
      maxHeight,
    }),
    multiValue: () => ({}),
    multiValueLabel: () => ({}),
    multiValueRemove: () => ({}),
    noOptionsMessage: () => ({}),
    option: () => ({}),
    placeholder: () => ({}),
    singleValue: () => ({}),
    valueContainer: () => ({}),
  };
}
