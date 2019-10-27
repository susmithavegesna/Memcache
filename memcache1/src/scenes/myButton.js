import React from 'react';

const Button = ({execute, children}) => {
  return (
    <button onClick={execute}>{children}</button>
  );
};

export default Button;