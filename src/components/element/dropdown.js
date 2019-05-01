import React from 'react';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';

export const DropdownList = (props) => {
  const { isOpen, toggleDropdown, state, list, selected, keyName, onClickDropdownValue } = props;

  return (
    <Dropdown isOpen={isOpen} toggle={() => toggleDropdown(state)}>
      <DropdownToggle caret>
        {selected}
      </DropdownToggle>
      <DropdownMenu>
        {list && list.map((item, index) => 
          <DropdownItem onClick={() => onClickDropdownValue(keyName, item)} key={index}>{item}</DropdownItem>)
        }
      </DropdownMenu>
    </Dropdown>
  );
};